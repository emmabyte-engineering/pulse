#!/usr/bin/env bash
#
# Rollback to previous deployment
# Usage: ./scripts/rollback.sh
#
# This script:
#   1. Stops the current app container
#   2. Restores the previous Docker image (pulse-app:previous)
#   3. Optionally restores the pre-deploy DB backup
#   4. Restarts with the previous image
#
# Required env vars:
#   POSTGRES_USER, POSTGRES_DB
#   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET (for DB restore)
#
set -euo pipefail

APP_IMAGE="pulse-app"

echo "==> Starting rollback..."

# Check previous image exists
if ! docker image inspect "${APP_IMAGE}:previous" &>/dev/null; then
  echo "ERROR: No previous image found (${APP_IMAGE}:previous)"
  echo "Cannot rollback — no prior deployment to revert to."
  exit 1
fi

# Ask about DB restore
echo ""
echo "Rollback options:"
echo "  1) App only — revert to previous image, keep current database"
echo "  2) Full — revert to previous image AND restore pre-deploy database backup"
read -rp "Choose (1/2): " CHOICE

echo ""
echo "==> Stopping current app..."
docker compose stop app

if [ "$CHOICE" = "2" ]; then
  echo "==> Finding latest pre-deploy backup..."
  LATEST_BACKUP=$(aws s3 ls "s3://${R2_BUCKET}/backups/" \
    --endpoint-url "${R2_ENDPOINT}" \
    | grep "pre-deploy" \
    | sort -r \
    | head -1 \
    | awk '{print $4}')

  if [ -z "$LATEST_BACKUP" ]; then
    echo "WARNING: No pre-deploy backup found. Skipping DB restore."
  else
    echo "==> Restoring DB from: ${LATEST_BACKUP}"
    TMPFILE="/tmp/pulse-rollback-restore.sql.gz"
    aws s3 cp "s3://${R2_BUCKET}/backups/${LATEST_BACKUP}" "$TMPFILE" \
      --endpoint-url "${R2_ENDPOINT}" --no-progress

    gunzip -c "$TMPFILE" | docker compose exec -T db psql \
      -U "${POSTGRES_USER:-pulse}" \
      -d "${POSTGRES_DB:-pulse}" \
      --quiet \
      --single-transaction

    rm -f "$TMPFILE"
    echo "==> Database restored"
  fi
fi

# Swap images: tag current as failed, previous as latest
echo "==> Reverting to previous image..."
docker tag "${APP_IMAGE}:latest" "${APP_IMAGE}:failed" 2>/dev/null || true
docker tag "${APP_IMAGE}:previous" "${APP_IMAGE}:latest"

echo "==> Restarting app with previous image..."
docker compose up -d app

# Wait for health
echo "==> Waiting for health check..."
for i in $(seq 1 12); do
  if curl -sf http://localhost:3000/api/health &>/dev/null; then
    echo "==> Rollback successful — app is healthy"
    exit 0
  fi
  sleep 5
done

echo "==> WARNING: App did not become healthy after rollback"
exit 1

#!/usr/bin/env bash
#
# Restore database from a Cloudflare R2 backup
# Usage: ./scripts/restore.sh [backup-filename]
#   If no filename given, lists available backups.
#
# Required env vars:
#   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET
#   POSTGRES_USER, POSTGRES_DB
#
set -euo pipefail

BACKUP_DIR="/tmp/pulse-backups"
mkdir -p "$BACKUP_DIR"

# List available backups if no argument
if [ $# -eq 0 ]; then
  echo "Available backups:"
  echo ""
  aws s3 ls "s3://${R2_BUCKET}/backups/" \
    --endpoint-url "${R2_ENDPOINT}" \
    | sort -r \
    | head -20
  echo ""
  echo "Usage: $0 <filename>"
  echo "  e.g., $0 pulse-daily-20260309-030000.sql.gz"
  exit 0
fi

FILENAME="$1"
LOCAL_PATH="${BACKUP_DIR}/${FILENAME}"

echo "==> Downloading: s3://${R2_BUCKET}/backups/${FILENAME}"
aws s3 cp "s3://${R2_BUCKET}/backups/${FILENAME}" "${LOCAL_PATH}" \
  --endpoint-url "${R2_ENDPOINT}" \
  --no-progress

echo "==> Downloaded: $(du -h "${LOCAL_PATH}" | cut -f1)"

# Confirm before restoring
echo ""
echo "WARNING: This will overwrite the current database."
echo "Database: ${POSTGRES_DB:-pulse}"
read -rp "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  rm -f "${LOCAL_PATH}"
  exit 1
fi

echo "==> Stopping app container..."
docker compose stop app 2>/dev/null || true

echo "==> Restoring database..."
gunzip -c "${LOCAL_PATH}" | docker compose exec -T db psql \
  -U "${POSTGRES_USER:-pulse}" \
  -d "${POSTGRES_DB:-pulse}" \
  --quiet \
  --single-transaction

echo "==> Restarting app..."
docker compose start app

# Clean up
rm -f "${LOCAL_PATH}"

echo "==> Restore complete from: ${FILENAME}"

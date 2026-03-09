#!/usr/bin/env bash
#
# Rollback to a previous deployment
# Usage: ./scripts/rollback.sh [image-tag]
#   If no tag given, lists recent deployments and prompts.
#
# Required env vars:
#   POSTGRES_USER, POSTGRES_DB
#   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET (for DB restore)
#   DOCKERHUB_USERNAME, DOCKERHUB_TOKEN (read from .env)
#
set -euo pipefail

DOCKER_REPO="emmabyte/pulse"

# Load Docker Hub credentials from .env
if [ -f .env ]; then
  DOCKERHUB_USER=$(grep DOCKERHUB_USERNAME .env | cut -d= -f2-)
  DOCKERHUB_TOKEN=$(grep DOCKERHUB_TOKEN .env | cut -d= -f2-)
  echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USER}" --password-stdin 2>/dev/null
fi

# Show current deployment
CURRENT=$(docker compose images app --format '{{.Repository}}:{{.Tag}}' 2>/dev/null | head -1 || echo "unknown")
echo "Current deployment: ${CURRENT}"
echo ""

if [ $# -eq 0 ]; then
  echo "Available tags on Docker Hub:"
  echo ""
  # List recent tags (Docker Hub API)
  curl -s "https://hub.docker.com/v2/repositories/${DOCKER_REPO}/tags/?page_size=15&ordering=-last_updated" \
    | python3 -c "
import sys, json
data = json.load(sys.stdin)
for t in data.get('results', []):
    name = t['name']
    updated = t['last_updated'][:19]
    size_mb = sum(i.get('size', 0) for i in t.get('images', [])) / 1024 / 1024
    print(f'  {name:<45} {updated}   {size_mb:.0f}MB')
" 2>/dev/null || echo "  (Could not fetch tags — check Docker Hub credentials)"

  echo ""
  echo "Available pre-deploy backups in R2:"
  aws s3 ls "s3://${R2_BUCKET}/backups/" \
    --endpoint-url "${R2_ENDPOINT}" \
    | grep "pre-deploy" \
    | sort -r \
    | head -10 \
    | awk '{print "  " $4}'

  echo ""
  echo "Usage: $0 <image-tag>"
  echo "  e.g., $0 abc1234def5678..."
  echo ""
  echo "The tag is the git commit SHA. The matching DB backup will be"
  echo "auto-detected from R2 (pre-deploy-<sha>)."
  exit 0
fi

TARGET_TAG="$1"

echo "==> Rolling back to: ${DOCKER_REPO}:${TARGET_TAG}"
echo ""

# Ask about DB restore
echo "Rollback options:"
echo "  1) App only — pull and deploy ${TARGET_TAG}, keep current database"
echo "  2) Full — pull ${TARGET_TAG} AND restore its paired pre-deploy backup"
read -rp "Choose (1/2): " CHOICE

echo ""

# Pull the target image
echo "==> Pulling ${DOCKER_REPO}:${TARGET_TAG}..."
docker pull "${DOCKER_REPO}:${TARGET_TAG}"

echo "==> Stopping current app..."
docker compose stop app

if [ "$CHOICE" = "2" ]; then
  echo "==> Looking for paired backup (pre-deploy-${TARGET_TAG})..."
  PAIRED_BACKUP=$(aws s3 ls "s3://${R2_BUCKET}/backups/" \
    --endpoint-url "${R2_ENDPOINT}" \
    | grep "pre-deploy-${TARGET_TAG}" \
    | sort -r \
    | head -1 \
    | awk '{print $4}')

  if [ -z "$PAIRED_BACKUP" ]; then
    echo "WARNING: No paired backup found for ${TARGET_TAG}."
    echo "Looking for nearest pre-deploy backup..."
    PAIRED_BACKUP=$(aws s3 ls "s3://${R2_BUCKET}/backups/" \
      --endpoint-url "${R2_ENDPOINT}" \
      | grep "pre-deploy" \
      | sort -r \
      | head -1 \
      | awk '{print $4}')
  fi

  if [ -n "$PAIRED_BACKUP" ]; then
    echo "==> Restoring DB from: ${PAIRED_BACKUP}"
    TMPFILE="/tmp/pulse-rollback-restore.sql.gz"
    aws s3 cp "s3://${R2_BUCKET}/backups/${PAIRED_BACKUP}" "$TMPFILE" \
      --endpoint-url "${R2_ENDPOINT}" --no-progress

    gunzip -c "$TMPFILE" | docker compose exec -T db psql \
      -U "${POSTGRES_USER:-pulse}" \
      -d "${POSTGRES_DB:-pulse}" \
      --quiet \
      --single-transaction

    rm -f "$TMPFILE"
    echo "==> Database restored"
  else
    echo "WARNING: No pre-deploy backup found at all. Skipping DB restore."
  fi
fi

# Deploy the target version
echo "==> Starting ${DOCKER_REPO}:${TARGET_TAG}..."
export DOCKER_IMAGE="${DOCKER_REPO}:${TARGET_TAG}"
docker compose up -d app

# Wait for health
echo "==> Waiting for health check..."
for i in $(seq 1 12); do
  if curl -sf http://localhost:3000/api/health &>/dev/null; then
    echo "==> Rollback successful — app is healthy (${DOCKER_REPO}:${TARGET_TAG})"

    # Update .env so the tag persists across restarts
    if [ -f .env ]; then
      sed -i "s|^DOCKER_IMAGE=.*|DOCKER_IMAGE=${DOCKER_REPO}:${TARGET_TAG}|" .env
    fi

    exit 0
  fi
  sleep 5
done

echo "==> WARNING: App did not become healthy after rollback"
exit 1

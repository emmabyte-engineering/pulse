#!/usr/bin/env bash
#
# Database backup to Cloudflare R2
# Usage: ./scripts/backup.sh [tag]
#   tag: optional label (e.g., "pre-deploy", "daily", "manual")
#
# Required env vars:
#   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET
#   POSTGRES_USER, POSTGRES_DB
#
set -euo pipefail

TAG="${1:-manual}"
TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")
FILENAME="pulse-${TAG}-${TIMESTAMP}.sql.gz"
BACKUP_DIR="/tmp/pulse-backups"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "==> Starting backup: ${FILENAME}"

# Dump from the Docker postgres container
docker compose exec -T db pg_dump \
  -U "${POSTGRES_USER:-pulse}" \
  -d "${POSTGRES_DB:-pulse}" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "==> Dump complete: ${SIZE}"

# Upload to R2
echo "==> Uploading to R2: s3://${R2_BUCKET}/backups/${FILENAME}"
aws s3 cp "${BACKUP_DIR}/${FILENAME}" "s3://${R2_BUCKET}/backups/${FILENAME}" \
  --endpoint-url "${R2_ENDPOINT}" \
  --no-progress

echo "==> Upload complete"

# Clean up local file
rm -f "${BACKUP_DIR}/${FILENAME}"

# Prune old backups from R2
echo "==> Pruning backups older than ${RETENTION_DAYS} days..."
CUTOFF=$(date -u -d "-${RETENTION_DAYS} days" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || \
         date -u -v-${RETENTION_DAYS}d +"%Y-%m-%dT%H:%M:%S")

aws s3api list-objects-v2 \
  --bucket "${R2_BUCKET}" \
  --prefix "backups/" \
  --endpoint-url "${R2_ENDPOINT}" \
  --query "Contents[?LastModified<'${CUTOFF}'].Key" \
  --output text 2>/dev/null | tr '\t' '\n' | while read -r key; do
    if [ -n "$key" ] && [ "$key" != "None" ]; then
      echo "    Deleting: ${key}"
      aws s3 rm "s3://${R2_BUCKET}/${key}" --endpoint-url "${R2_ENDPOINT}" --quiet
    fi
  done

echo "==> Backup complete: ${FILENAME}"

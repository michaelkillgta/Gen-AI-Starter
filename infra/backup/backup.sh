#!/usr/bin/env bash
# Nightly database backup: a compressed pg_dump, keeping the last 14 days.
#
# Install on the server (runs at 02:30 every night):
#   sudo cp infra/backup/backup.sh /usr/local/bin/field-tested-backup
#   sudo chmod +x /usr/local/bin/field-tested-backup
#   echo "30 2 * * * root cd /opt/field-tested && /usr/local/bin/field-tested-backup >> /var/log/field-tested-backup.log 2>&1" \
#     | sudo tee /etc/cron.d/field-tested-backup
#
# Run by hand from the repo folder:  sudo infra/backup/backup.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/field-tested}"
KEEP_DAYS="${KEEP_DAYS:-14}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
STAMP="$(date -u +%Y-%m-%dT%H%MZ)"
FILE="$BACKUP_DIR/fieldtested-$STAMP.sql.gz"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Custom-safe plain SQL, compressed. Written to a temp name first so a failed
# dump never looks like a good backup.
$COMPOSE exec -T db pg_dump -U fieldtested -d fieldtested --no-owner --clean --if-exists \
  | gzip -9 > "$FILE.partial"
mv "$FILE.partial" "$FILE"
chmod 600 "$FILE"

# Sanity check: the dump must mention the waitlist table.
if ! gzip -dc "$FILE" | grep -q "waitlist_signups"; then
  echo "$(date -u) backup $FILE looks wrong" >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'fieldtested-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
echo "$(date -u) backup ok: $FILE ($(du -h "$FILE" | cut -f1))"

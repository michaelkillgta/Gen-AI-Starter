# Backups and restore

`backup.sh` makes a compressed `pg_dump` every night and keeps 14 days of backups in
`/var/backups/field-tested/`. Install it with the three commands at the top of the script.

The backups hold phone numbers and emails. The folder is readable by root only, so keep it that way.

## Keep a copy off the server (recommended)

A backup on the same server doesn't help if the server is lost. Once a week, copy the newest file to your laptop:

```bash
scp root@SERVER-IP:/var/backups/field-tested/$(ssh root@SERVER-IP 'ls -t /var/backups/field-tested | head -1') .
```

## Restore

1. Pick a backup: `ls -lt /var/backups/field-tested`
2. Stop the website and API so nothing writes during the restore:
   ```bash
   cd /opt/field-tested
   docker compose -f docker-compose.prod.yml --env-file .env.production stop web api
   ```
3. Load the backup. It replaces the current tables, because it was made with `--clean`:
   ```bash
   gzip -dc /var/backups/field-tested/fieldtested-2026-10-01T0230Z.sql.gz \
     | docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db psql -U fieldtested -d fieldtested
   ```
4. Start again and check:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production start api web
   docker compose -f docker-compose.prod.yml --env-file .env.production exec api wget -qO- http://127.0.0.1:8080/health
   ```
5. Content (tools, tracks, posts) always comes from `api/seed/`. After a restore you can run
   `docker compose … exec api /app/api seed` to be sure it matches the repo.

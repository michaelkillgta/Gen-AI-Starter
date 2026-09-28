#!/usr/bin/env bash
# Local PostgreSQL inside Ubuntu (WSL) on port 5433, for `pnpm dev`.
# Uses Ubuntu's own postgresql package, run as this user (no system service,
# no sudo). Windows reaches it at localhost:5433 through WSL's port forwarding.
#
#   scripts/wsl/db.sh          start (creates the cluster and databases on first run)
#
# Data lives in the Linux home folder, never on OneDrive.
set -euo pipefail

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
if [ -z "$PGBIN" ]; then
  echo "db: PostgreSQL isn't installed in Ubuntu. Run: sudo apt install -y postgresql" >&2
  exit 1
fi
DATA=${PGDATA_DIR:-$HOME/.local/share/field-tested-pgdata}
PORT=${PGPORT:-5433}
SOCK=$HOME/.cache/field-tested-pgsock
mkdir -p "$SOCK"

if [ ! -f "$DATA/PG_VERSION" ]; then
  echo "db: creating cluster in $DATA"
  pw=$(mktemp)
  echo fieldtested_dev >"$pw" # local development only
  "$PGBIN/initdb" -D "$DATA" -U fieldtested --pwfile="$pw" -A scram-sha-256 -E UTF8 --locale=C >/dev/null
  rm -f "$pw"
fi

# A copy left running by an earlier session (closing the window can leave it).
"$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1 && "$PGBIN/pg_ctl" -D "$DATA" stop -m fast >/dev/null

"$PGBIN/pg_ctl" -D "$DATA" -l "$DATA/server.log" -w \
  -o "-p $PORT -k $SOCK -c listen_addresses=localhost" start >/dev/null

export PGPASSWORD=fieldtested_dev
for db in fieldtested fieldtested_test; do
  if ! "$PGBIN/psql" -h localhost -p "$PORT" -U fieldtested -d postgres -tAc \
    "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
    "$PGBIN/createdb" -h localhost -p "$PORT" -U fieldtested "$db"
    echo "db: created database $db"
  fi
done
echo "db: PostgreSQL $("$PGBIN/postgres" -V | awk '{print $3}') ready on localhost:$PORT (Ctrl+C to stop)"

stop() {
  "$PGBIN/pg_ctl" -D "$DATA" stop -m fast >/dev/null 2>&1 || true
  exit 0
}
trap stop INT TERM HUP
while "$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; do sleep 2; done
echo "db: stopped" >&2
exit 1

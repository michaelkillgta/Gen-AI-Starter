#!/usr/bin/env bash
# Runs cargo in api/ inside Ubuntu (WSL). Build output goes to the Linux home
# folder: fast, and never synced by OneDrive.
#   scripts/wsl/cargo.sh run          the API on port 8080
#   scripts/wsl/cargo.sh test         tests, and regenerates web/src/lib/api-types
set -euo pipefail

# shellcheck source=/dev/null
[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"
if ! command -v cargo >/dev/null; then
  echo "Rust isn't installed in Ubuntu. See docs/decisions.md (Windows: build the API in WSL)." >&2
  exit 1
fi

cd "$(dirname "$0")/../../api"
export CARGO_TARGET_DIR=${CARGO_TARGET_DIR:-$HOME/.cache/field-tested-target}
# Inside WSL, listen on all of WSL's own addresses so Windows reaches it at
# localhost:8080 (WSL forwards it). WSL's network is private to this laptop.
export API_BIND=${WSL_API_BIND:-0.0.0.0:8080}

# Stop an API left running by an earlier window, or `run` fails with "address in use".
if [ "${1:-}" = run ]; then pkill -x api 2>/dev/null || true; fi
exec cargo "$@"

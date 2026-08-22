#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="${TMPDIR:-/tmp}/ayuntamiento-belmontejo-news.lock"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"

if [[ -z "$NODE_BIN" ]]; then
  echo 'Node.js is not available; refusing to install it automatically.' >&2
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! /usr/bin/flock -n 9; then
  echo 'Another news discovery is already running; skipping this run.'
  exit 0
fi

cd "$PROJECT_ROOT"
exec "$NODE_BIN" scripts/run-news-discovery.js


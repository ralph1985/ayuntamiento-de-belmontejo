#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="${TMPDIR:-/tmp}/ayuntamiento-belmontejo-bandos.lock"
PNPM_BIN="${PNPM_BIN:-$(command -v pnpm || true)}"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"

if [[ -z "$PNPM_BIN" || -z "$NODE_BIN" ]]; then
  echo 'pnpm or Node.js is not available; refusing to install either automatically.' >&2
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! /usr/bin/flock -n 9; then
  echo 'Another bando synchronization is already running; skipping this run.'
  exit 0
fi

cd "$PROJECT_ROOT"

if [[ "$(/usr/bin/git branch --show-current)" != 'main' ]]; then
  echo 'The repository is not on main; refusing to synchronize.' >&2
  exit 1
fi

if [[ -n "$(/usr/bin/git status --porcelain)" ]]; then
  echo 'The working tree is not clean; refusing to overwrite local changes.' >&2
  exit 1
fi

if [[ ! -d node_modules/.pnpm ]]; then
  echo 'Dependencies are missing; refusing to install them automatically.' >&2
  exit 1
fi

/usr/bin/git fetch origin main
/usr/bin/git merge --ff-only origin/main
"$PNPM_BIN" run fetch-bandos

if /usr/bin/git diff --quiet -- src/content/bandos; then
  echo 'No new or updated bandos to publish.'
  exit 0
fi

"$PNPM_BIN" run test:unit
OAUTH_GITHUB_CLIENT_ID=cron OAUTH_GITHUB_CLIENT_SECRET=cron "$PNPM_BIN" run build

if [[ "${SYNC_BANDOS_DRY_RUN:-0}" == '1' ]]; then
  echo 'Dry run completed; changes were not committed or pushed.'
  exit 0
fi

/usr/bin/git add -- src/content/bandos
/usr/bin/git commit -m 'chore(bandos): sync municipal notices'
commit_sha=$(/usr/bin/git rev-parse HEAD)
/usr/bin/git push origin main
"$NODE_BIN" scripts/notify-bando-sync.js "$commit_sha"

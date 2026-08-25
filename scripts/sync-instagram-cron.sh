#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="${TMPDIR:-/tmp}/ayuntamiento-belmontejo-instagram.lock"
REPORT_FILE="${TMPDIR:-/tmp}/ayuntamiento-belmontejo-instagram-result.json"
PNPM_BIN="${PNPM_BIN:-$(command -v pnpm || true)}"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"

if [[ -z "$PNPM_BIN" || -z "$NODE_BIN" ]]; then
  echo 'pnpm or Node.js is not available; refusing to install either automatically.' >&2
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! /usr/bin/flock -n 9; then
  echo 'Another Instagram synchronization is already running; skipping this run.'
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
INSTAGRAM_SYNC_REPORT="$REPORT_FILE" "$PNPM_BIN" run fetch-instagram

if
  /usr/bin/git diff --quiet -- src/data/instagramPosts.json &&
  [[ -z "$(/usr/bin/git status --porcelain -- public/assets/images/instagram)" ]]
then
  echo 'No new or updated Instagram publications to publish.'
  exit 0
fi

"$PNPM_BIN" run test:unit
"$PNPM_BIN" run build

if [[ "${INSTAGRAM_SYNC_DRY_RUN:-0}" == '1' ]]; then
  echo 'Dry run completed; changes were not committed or pushed.'
  exit 0
fi

/usr/bin/git add -- src/data/instagramPosts.json public/assets/images/instagram
/usr/bin/git commit -m 'chore(instagram): sync municipal publications'
commit_sha=$(/usr/bin/git rev-parse HEAD)
/usr/bin/git push origin main
INSTAGRAM_SYNC_REPORT="$REPORT_FILE" "$NODE_BIN" scripts/notify-instagram-sync.js "$commit_sha"

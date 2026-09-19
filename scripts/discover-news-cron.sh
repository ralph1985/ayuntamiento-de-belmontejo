#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="${TMPDIR:-/tmp}/ayuntamiento-belmontejo-news.lock"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
LOG_DIR="${NEWS_LOG_DIR:-$PROJECT_ROOT/var/log/news-discovery}"
RETENTION_DAYS="${NEWS_LOG_RETENTION_DAYS:-90}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
LOG_DATE="$(TZ=Europe/Madrid date +%F)"
LOG_FILE="$LOG_DIR/news-discovery-$LOG_DATE.jsonl"

umask 077
mkdir -p "$LOG_DIR"
exec >>"$LOG_FILE" 2>&1

emit_shell_event() {
  local event="$1"
  local status="$2"
  printf '{"at":"%s","runId":"%s","event":"%s","status":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$RUN_ID" "$event" "$status"
}

if ! [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  emit_shell_event 'failed' 'invalid-retention'
  exit 1
fi

find "$LOG_DIR" -maxdepth 1 -type f -name 'news-discovery-*.jsonl' \
  -mtime "+$RETENTION_DAYS" -delete

if [[ -z "$NODE_BIN" ]]; then
  emit_shell_event 'failed' 'node-unavailable'
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! /usr/bin/flock -n 9; then
  emit_shell_event 'skipped' 'lock-held'
  exit 0
fi

cd "$PROJECT_ROOT"
set +e
"$NODE_BIN" scripts/run-news-discovery.js
exit_code=$?
set -e

if ((exit_code != 0)); then
  emit_shell_event 'process-exit' "failed-$exit_code"
fi

exit "$exit_code"

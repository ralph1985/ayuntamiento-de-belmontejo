#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_ROOT="${TMPDIR:-/tmp}"
LOCK_FILE="$TEMP_ROOT/ayuntamiento-belmontejo-instagram.lock"
REPORT_FILE="$TEMP_ROOT/ayuntamiento-belmontejo-instagram-result.json"
PNPM_BIN="${PNPM_BIN:-$(command -v pnpm || true)}"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
GH_BIN="${GH_BIN:-$(command -v gh || true)}"
FAILURE_NOTIFIER="$PROJECT_ROOT/scripts/notify-instagram-failure.js"

WORKTREE_DIR=''
WORKTREE_BRANCH=''
PR_URL=''
PHASE='inicio'
FAILED_COMMAND=''
FAILED_LINE=''
FAILURE_NOTIFIED=0

cleanup_worktree() {
  if [[ -n "$WORKTREE_DIR" && -d "$WORKTREE_DIR" ]]; then
    /usr/bin/git -C "$PROJECT_ROOT" worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true
  fi
}

notify_failure() {
  local exit_code="$1"

  if (( FAILURE_NOTIFIED == 1 )) || [[ "${INSTAGRAM_SYNC_DRY_RUN:-0}" == '1' ]]; then
    return 0
  fi
  FAILURE_NOTIFIED=1

  if [[ -z "$NODE_BIN" || ! -f "$FAILURE_NOTIFIER" ]]; then
    echo 'No se pudo enviar el aviso de fallo de Instagram: Node.js o el notificador no están disponibles.' >&2
    return 0
  fi

  if ! INSTAGRAM_FAILURE_PHASE="$PHASE" \
    INSTAGRAM_FAILURE_ERROR="${FAILED_COMMAND:-comando desconocido} (línea ${FAILED_LINE:-desconocida}, salida ${exit_code})" \
    INSTAGRAM_FAILURE_BRANCH="$WORKTREE_BRANCH" \
    INSTAGRAM_FAILURE_PR_URL="$PR_URL" \
    INSTAGRAM_SYNC_REPORT="$REPORT_FILE" \
    "$NODE_BIN" "$FAILURE_NOTIFIER"; then
    echo 'No se pudo enviar el aviso de fallo de Instagram.' >&2
  fi
}

on_error() {
  FAILED_COMMAND="$BASH_COMMAND"
  FAILED_LINE="$LINENO"
}

on_exit() {
  local exit_code="$?"
  if (( exit_code != 0 )); then
    notify_failure "$exit_code"
  fi
  cleanup_worktree
  exit "$exit_code"
}

trap on_error ERR
trap on_exit EXIT

exec 9>"$LOCK_FILE"
if ! /usr/bin/flock -n 9; then
  echo 'Otra sincronización de Instagram ya está en ejecución; se omite esta ejecución.'
  exit 0
fi

if [[ -z "$PNPM_BIN" || -z "$NODE_BIN" || -z "$GH_BIN" ]]; then
  PHASE='comprobación de herramientas'
  echo 'pnpm, Node.js o gh no están disponibles; se cancela la sincronización.' >&2
  exit 1
fi

cd "$PROJECT_ROOT"

PHASE='autenticación de GitHub'
"$GH_BIN" auth status >/dev/null

PHASE='preparación del worktree'
/usr/bin/git fetch origin main
WORKTREE_DIR="$(mktemp -d "$TEMP_ROOT/ayuntamiento-belmontejo-instagram.XXXXXX")"
rmdir "$WORKTREE_DIR"
/usr/bin/git worktree add --detach "$WORKTREE_DIR" origin/main

if [[ -f "$PROJECT_ROOT/.env" ]]; then
  ln -s "$PROJECT_ROOT/.env" "$WORKTREE_DIR/.env"
fi

PHASE='preparación de dependencias'
(
  cd "$WORKTREE_DIR"
  "$PNPM_BIN" install --frozen-lockfile --prefer-offline
)

PHASE='extracción de Instagram'
(
  cd "$WORKTREE_DIR"
  INSTAGRAM_SYNC_REPORT="$REPORT_FILE" "$PNPM_BIN" run fetch-instagram
)

if
  /usr/bin/git -C "$WORKTREE_DIR" diff --quiet -- src/data/instagramPosts.json &&
  [[ -z "$(/usr/bin/git -C "$WORKTREE_DIR" status --porcelain -- public/assets/images/instagram)" ]]
then
  echo 'No hay publicaciones nuevas o actualizadas de Instagram.'
  exit 0
fi

PHASE='validación de la sincronización'
(
  cd "$WORKTREE_DIR"
  "$PNPM_BIN" run test:unit
  "$PNPM_BIN" run build
)

if [[ "${INSTAGRAM_SYNC_DRY_RUN:-0}" == '1' ]]; then
  echo 'Dry run completado; no se creó PR ni se enviaron cambios.'
  exit 0
fi

PHASE='preparación de la rama'
WORKTREE_BRANCH="chore/instagram-sync-$(date -u +%Y%m%d-%H%M%S)"
/usr/bin/git -C "$WORKTREE_DIR" switch -c "$WORKTREE_BRANCH"
/usr/bin/git -C "$WORKTREE_DIR" add -- src/data/instagramPosts.json public/assets/images/instagram
/usr/bin/git -C "$WORKTREE_DIR" diff --cached --check

while IFS= read -r changed_file; do
  case "$changed_file" in
    src/data/instagramPosts.json|public/assets/images/instagram/*) ;;
    *)
      echo "Archivo inesperado en la sincronización de Instagram: $changed_file" >&2
      exit 1
      ;;
  esac
done < <(/usr/bin/git -C "$WORKTREE_DIR" diff --cached --name-only)

/usr/bin/git -C "$WORKTREE_DIR" commit -m 'chore(instagram): sync municipal publications'

PHASE='publicación de la rama'
/usr/bin/git -C "$WORKTREE_DIR" push --set-upstream origin "$WORKTREE_BRANCH"

PHASE='creación del Pull Request'
GH_TOKEN="$("$GH_BIN" auth token)"
export GH_TOKEN
PR_URL="$("$GH_BIN" pr create \
  --base main \
  --head "$WORKTREE_BRANCH" \
  --title 'chore(instagram): sync municipal publications' \
  --body '## Sincronización automática de Instagram

Esta PR contiene nuevas o actualizadas publicaciones del perfil municipal.

El cron ejecutará el auto-merge cuando pasen los checks obligatorios.

_Generada por scripts/sync-instagram-cron.sh._')"
echo "Pull Request creado: $PR_URL"

PHASE='espera de checks del Pull Request'
PR_NUMBER="${PR_URL##*/}"
/usr/bin/timeout "${INSTAGRAM_PR_TIMEOUT_SECONDS:-900}" \
  "$GH_BIN" pr checks "$PR_NUMBER" --watch

PHASE='merge del Pull Request'
"$GH_BIN" pr merge "$PR_NUMBER" --merge --delete-branch
MERGE_COMMIT="$("$GH_BIN" pr view "$PR_NUMBER" --json mergeCommit --jq '.mergeCommit.oid')"
if [[ ! "$MERGE_COMMIT" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'GitHub no devolvió el SHA del merge.' >&2
  exit 1
fi

PHASE='notificación de éxito'
INSTAGRAM_SYNC_REPORT="$REPORT_FILE" "$NODE_BIN" "$PROJECT_ROOT/scripts/notify-instagram-sync.js" "$MERGE_COMMIT"
echo "Sincronización de Instagram fusionada en $MERGE_COMMIT."

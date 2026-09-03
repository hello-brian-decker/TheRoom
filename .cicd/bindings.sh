# bindings.sh — reduced profile. Sourced by .cicd/ops.sh; do not edit ops.sh.
# Every verb below routes its commands through ops.sh's run(), so --dry-run
# is honest here rather than refused.
OPS_DRY_RUN_SAFE=1

PORT=7878
LOG="/opt/logs/TheRoom/staging/staging.log"

# --strictPort so the server fails loudly instead of drifting to another port
# and leaving every probe wrong.
staging_up() {
  dry && { note "would start $SLUG on :$PORT"; return 0; }
  run mkdir -p "$(dirname "$LOG")"
  npm run build >>"$LOG" 2>&1
  nohup npx vite preview --host 0.0.0.0 --port "$PORT" --strictPort >>"$LOG" 2>&1 & disown
  sleep 3
}
staging_down()    { dry && { note "would stop the listener on :$PORT"; return 0; }; lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | xargs kill 2>/dev/null || true; }
staging_restart() { staging_down; sleep 1; staging_up; }
staging_status()  { lsof -nP -iTCP:"$PORT" -sTCP:LISTEN || echo "TheRoom not listening on :$PORT"; }
staging_logs()    { mkdir -p "$(dirname "$LOG")"; touch "$LOG"; run tail -f "$LOG"; }

staging_backup_db()   { echo "no backend, no database" >&2; return 3; }
staging_restore_db()  { echo "no backend, no database" >&2; return 3; }
staging_backup_files(){ echo "no server-side state to archive" >&2; return 3; }

# start.sh handles dev / build / preview / electron. Electron forces port 5173
# and spawns child processes a naive stop would orphan.
dev_up() { run ./start.sh dev "$@"; }

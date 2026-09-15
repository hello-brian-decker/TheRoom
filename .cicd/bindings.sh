# bindings.sh — reduced profile. Sourced by .cicd/ops.sh; do not edit ops.sh.
# Every verb below routes its commands through ops.sh's run(), so --dry-run
# is honest here rather than refused. Portable: macOS, Linux and Windows (Git
# Bash) — only ops.sh's os_* primitives, no lsof / nohup / launchctl.
OPS_DRY_RUN_SAFE=1

PORT=7878
# LOG_DIR is the manifest's log_dir, already placed on this host by ops.sh.
LOG="$LOG_DIR/staging.log"

# --strictPort so the server fails loudly instead of drifting to another port
# and leaving every probe wrong.
staging_up() {
  dry && { note "would start $SLUG on :$PORT"; return 0; }
  os_port_busy "$PORT" && { ok "$SLUG already listening on :$PORT"; return 0; }
  mkdir -p "$(dirname "$LOG")"
  npm run build >>"$LOG" 2>&1
  os_bg "$LOG" npx vite preview --host 0.0.0.0 --port "$PORT" --strictPort >/dev/null
  sleep 3
}
staging_down()    { dry && { note "would stop the listener on :$PORT"; return 0; }; os_kill_port "$PORT"; }
staging_restart() { staging_down; sleep 1; staging_up; }
staging_status()  { os_port_report "$PORT" || echo "TheRoom not listening on :$PORT"; }
staging_logs()    { mkdir -p "$(dirname "$LOG")"; touch "$LOG"; run tail -n 200 -F "$LOG"; }

staging_backup_db()   { echo "no backend, no database" >&2; return 3; }
staging_restore_db()  { echo "no backend, no database" >&2; return 3; }
staging_backup_files(){ echo "no server-side state to archive" >&2; return 3; }

# start.sh handles dev / build / preview / electron. Electron forces port 5173
# and spawns child processes a naive stop would orphan.
dev_up() { run ./start.sh dev "$@"; }

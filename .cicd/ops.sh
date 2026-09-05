#!/usr/bin/env bash
# ops.sh — CustomAppLab fleet operations dispatcher.
#
#   .cicd/ops.sh <env> <verb> [args] [flags]
#
#   env    dev | staging | prod   (whatever .cicd/project.yml declares)
#   verb   (local) up down restart wipe status health logs backup-db
#                  backup-files restore-db autostart doctor
#          (prod)  deploy rollback build status migrate backup-db restore-db
#
# THIS FILE IS IDENTICAL IN EVERY REPO. Do not put project logic here — it
# belongs in .cicd/bindings.sh. Verify with:  .cicd/ops.sh --version
#
# It is also identical on every OS: macOS, Linux and Windows (Git Bash) are
# detected at startup and every platform-specific primitive — file modes,
# digests, port probes, the service manager behind `autostart` — dispatches
# on that. `--version` prints which platform it decided it is on.
#
# Resolution order for a local verb:
#   1. a function named <env>_<verb> in .cicd/bindings.sh   (project-specific)
#   2. a generic implementation driven by .cicd/project.yml (health, backup-db,
#      restore-db, autostart, doctor, and compose-based status/logs/restart)
#   3. exit 3 — "not supported in this project", with the reason
#
# Exit codes: 0 ok · 1 failed · 2 usage · 3 unsupported · 4 missing tool
#             5 unhealthy · 6 refused by a safety guard
#
# See: g01-base-infra/docs/fleet-operations.md
set -euo pipefail

OPS_VERSION="1.1.0"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
CICD="$ROOT/.cicd"
MANIFEST="$CICD/project.yml"

# ----------------------------------------------------------------- output ---
if [[ -t 2 ]]; then
  RED=$'\033[0;31m'; YEL=$'\033[0;33m'; GRN=$'\033[0;32m'; DIM=$'\033[2m'; NC=$'\033[0m'
else
  RED=""; YEL=""; GRN=""; DIM=""; NC=""
fi
err()  { printf '%s%s%s\n' "$RED" "$*" "$NC" >&2; }
warn() { printf '%s%s%s\n' "$YEL" "$*" "$NC" >&2; }
ok()   { [[ "$QUIET" == 1 ]] || printf '%s%s%s\n' "$GRN" "$*" "$NC"; }
note() { [[ "$QUIET" == 1 ]] || printf '%s%s%s\n' "$DIM" "$*" "$NC" >&2; }
die()  { err "$1"; exit "${2:-1}"; }
have() { declare -F "$1" >/dev/null 2>&1; }
need() { command -v "$1" >/dev/null 2>&1 || die "$1 is required but not on PATH." 4; }

# --------------------------------------------------------------- platform ---
# The fleet registry (g01-base-deploy/hosts.yml) declares an `os:` per host,
# and a play will chdir into a checkout on ANY of them and run this script.
# So the ops layer cannot assume the Mac mini. Every primitive below has a
# different spelling per platform — `stat -f` vs `stat -c`, `shasum` vs
# `sha256sum`, `lsof` vs `ss` vs `netstat -ano`, launchd vs systemd vs
# schtasks — and guessing wrong fails deep inside a verb, long after the
# point where it could have said something useful.
#
# "windows" means Git Bash (MSYS/MinGW) or Cygwin. A native cmd or PowerShell
# session cannot run this script at all, so there is no fourth case to model.
#
# Deliberately NOT exported and deliberately not called OS: Windows already
# ships OS=Windows_NT in the environment and tools read it.
case "$(uname -s 2>/dev/null || echo unknown)" in
  Darwin)               OPS_OS=mac ;;
  Linux)                OPS_OS=linux ;;
  MINGW*|MSYS*|CYGWIN*) OPS_OS=windows ;;
  *)                    OPS_OS=unknown ;;
esac

# os_sha256 <file> — the digest alone, no filename, no leading spaces.
os_sha256() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | cut -d' ' -f1
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | cut -d' ' -f1
  elif command -v openssl >/dev/null 2>&1; then
    openssl dgst -sha256 "$1" | awk '{print $NF}'
  else
    echo unknown
  fi
}

# os_file_mode <file> — permission bits in octal, or a marker when the
# platform has none to give. Windows authorises by ACL; Git Bash answers
# `stat` with an invented 0644/0755 that means nothing, so saying "n/a" is
# more honest than reporting a number no one set.
os_file_mode() {
  case "$OPS_OS" in
    mac)     stat -f '%Lp' "$1" 2>/dev/null || echo '?' ;;
    linux)   stat -c '%a'  "$1" 2>/dev/null || echo '?' ;;
    windows) echo 'n/a' ;;
    *)       stat -c '%a' "$1" 2>/dev/null || stat -f '%Lp' "$1" 2>/dev/null || echo '?' ;;
  esac
}

# os_port_pids <port> — pids holding a TCP port open, one per line.
# Git Bash has no lsof and Windows netstat reports the owning pid itself;
# a minimal Linux container often has ss but not lsof.
#
# ALWAYS succeeds. "nothing is listening" is an answer, not a failure, but
# lsof exits 1 when it matches nothing and `set -o pipefail` carries that out
# of the pipeline — so `pids="$(os_port_pids 8089)"` in a binding would abort
# the whole verb under `set -e` on the perfectly normal path where the port
# is free. Callers test the string; they must never have to guard the call.
os_port_pids() {
  local port="$1"
  _os_port_pids "$port" || true
}
_os_port_pids() {
  local port="$1"
  case "$OPS_OS" in
    windows)
      netstat -ano 2>/dev/null | awk -v p=":$port" \
        '$1 == "TCP" && $4 == "LISTENING" && substr($2, length($2)-length(p)+1) == p {print $5}' \
        | sort -u ;;
    *)
      if command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | sort -u
      elif command -v ss >/dev/null 2>&1; then
        ss -lntpH "sport = :$port" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u
      elif command -v netstat >/dev/null 2>&1; then
        netstat -lntp 2>/dev/null | awk -v p=":$port" '$4 ~ p"$" {split($7,a,"/"); print a[1]}' | sort -u
      fi ;;
  esac
}

# os_port_busy <port> — true when something is listening.
os_port_busy() { [[ -n "$(os_port_pids "$1")" ]]; }

# os_kill_port <port> [force] — stop whatever holds a TCP port.
#
# The portable replacement for the `lsof … -t | xargs kill` that nine repos'
# staging_down still spells by hand. Two things make that form wrong off
# macOS: lsof is not there, and the pids Windows netstat reports are native
# Windows pids that Git Bash's `kill` cannot signal at all — taskkill is the
# only thing that can. Always succeeds; an unheld port is not an error.
os_kill_port() {
  local port="$1" force="${2:-}" pids pid
  pids="$(os_port_pids "$port")"
  [[ -n "$pids" ]] || return 0
  for pid in $pids; do
    case "$OPS_OS" in
      windows)
        if [[ "$force" == force ]]; then taskkill //PID "$pid" //F >/dev/null 2>&1 || true
        else taskkill //PID "$pid" >/dev/null 2>&1 || true; fi ;;
      *)
        if [[ "$force" == force ]]; then kill -9 "$pid" 2>/dev/null || true
        else kill "$pid" 2>/dev/null || true; fi ;;
    esac
  done
  return 0
}

usage() {
  cat >&2 <<EOF
Usage: .cicd/ops.sh <env> <verb> [args] [flags]

  env     ${E_ENVIRONMENTS:-dev | staging | prod}
  verb    local  up down restart wipe status health logs
                 backup-db backup-files restore-db autostart doctor
          prod   deploy rollback build status migrate backup-db restore-db

  flags   --json     machine-readable output (status, health, doctor)
          --yes      confirm a destructive action (wipe, restore-db)
          --quiet    suppress progress chatter
          --dry-run  print what would happen, change nothing

Examples:
  .cicd/ops.sh staging up
  .cicd/ops.sh staging health --json
  .cicd/ops.sh staging backup-db
  .cicd/ops.sh staging restore-db --from latest --yes
  .cicd/ops.sh staging autostart on
  .cicd/ops.sh prod deploy v1.2.3
EOF
  exit 2
}

# ------------------------------------------------------------------ flags ---
JSON=0; ASSUME_YES=0; QUIET=0; DRY=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --json)    JSON=1 ;;
    --yes|-y)  ASSUME_YES=1 ;;
    --quiet|-q) QUIET=1 ;;
    --dry-run) DRY=1 ;;
    --version) printf 'ops.sh %s (%s)\n' "$OPS_VERSION" "$OPS_OS"; exit 0 ;;
    --help|-h) usage ;;
    *) ARGS+=("$a") ;;
  esac
done
set -- ${ARGS[@]+"${ARGS[@]}"}

run() {  # run <cmd...> — honours --dry-run
  if [[ "$DRY" == 1 ]]; then note "would run: $*"; return 0; fi
  "$@"
}

# dry — true when --dry-run is active. For the shapes run() cannot wrap: a
# pipeline, a backgrounded `nohup ... & disown`, or a block that only makes
# sense as a whole. Guard the function instead:
#
#   staging_up() {
#     dry && { note "would start $SLUG on :$PORT"; return 0; }
#     ...
#   }
dry() { [[ "$DRY" == 1 ]]; }

confirm() {  # confirm <prompt> — required for destructive verbs
  [[ "$ASSUME_YES" == 1 ]] && return 0
  if [[ ! -t 0 ]]; then
    err "$1"
    die "Refusing a destructive action in a non-interactive shell. Pass --yes." 6
  fi
  printf '%s [y/N] ' "$1" >&2
  local ans; read -r ans
  [[ "$ans" =~ ^[Yy] ]] || die "Aborted." 6
}

# --------------------------------------------------------------- manifest ---
PY=""
for c in python3 /usr/local/bin/python3 /opt/homebrew/bin/python3 /usr/bin/python3; do
  command -v "$c" >/dev/null 2>&1 && { PY="$c"; break; }
done
[[ -n "$PY" ]] || die "python3 is required to read .cicd/project.yml." 4
[[ -f "$MANIFEST" ]] || die "missing $MANIFEST — this repo is not on the fleet ops standard yet."

ENV_NAME="${1:-}"; VERB="${2:-}"
[[ -n "$ENV_NAME" && -n "$VERB" ]] || { eval "$("$PY" "$CICD/manifest.py" "$MANIFEST" 2>/dev/null || true)"; usage; }
shift 2 || true

# Capture first, then eval: `eval "$(cmd)"` would swallow cmd's exit status and
# carry on with an empty environment, turning a bad env name into a confusing
# "P_PROJECT is missing" further down.
MF_OUT="$("$PY" "$CICD/manifest.py" "$MANIFEST" "$ENV_NAME")" || exit 1
eval "$MF_OUT"

PROJECT="${P_PROJECT:?manifest is missing 'project'}"
SLUG="${P_SLUG:-$PROJECT}"

# ---- ops-layer config ------------------------------------------------------
# Host-local settings for the ops layer itself live OUTSIDE the checkout, at
# /opt/configs/<project>/.env.cicd (mode 0600). Sourced after the manifest so a
# host can override any manifest value — a port that collides here, a different
# retention, a health token — without editing a tracked file.
#
# Per-environment APPLICATION config is a separate file in the same directory:
# /opt/configs/<project>/<env>.env, named by the manifest's `config:` key.
CONFIG_ROOT="${CONFIG_ROOT:-/opt/configs}"
CONFIG_DIR="$CONFIG_ROOT/$PROJECT"
CICD_ENV_FILE="$CONFIG_DIR/.env.cicd"
if [[ -f "$CICD_ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$CICD_ENV_FILE"
  set +a
fi
export CONFIG_ROOT CONFIG_DIR CICD_ENV_FILE PROJECT SLUG ENV_NAME

LOG_DIR="${E_LOG_DIR:-/opt/logs/$PROJECT/$ENV_NAME}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/$PROJECT/database/$ENV_NAME}"

# ------------------------------------------------------- compose defaults ---
compose_declared() { [[ -n "${E_COMPOSE_FILES:-}" ]]; }
dc() {  # dc <args...> — docker compose against this environment's files
  need docker
  local files=() f
  for f in $E_COMPOSE_FILES; do files+=(-f "$f"); done
  COMPOSE_PROJECT_NAME="${E_COMPOSE_PROJECT_NAME:-$PROJECT}" \
    docker compose "${files[@]}" "$@"
}

# ------------------------------------------------------- generic: health ----
generic_health() {
  local url="${E_URL:-}" path="${E_HEALTH_PATH:-/healthz}"
  [[ -n "$url" ]] || { err "no 'url' declared for $ENV_NAME in $MANIFEST"; return 3; }

  # Some apps genuinely have no health endpoint. For those the manifest says
  # `health_mode: tcp` and we probe the port instead of guessing at a route —
  # better an honest liveness check than a heavy GET / that forks subprocesses.
  if [[ "${E_HEALTH_MODE:-http}" == "tcp" ]]; then
    local hp="${E_PORTS%% *}" live=1
    if os_port_busy "$hp"; then live=0; fi
    if [[ "$JSON" == 1 ]]; then
      printf '{"project":"%s","env":"%s","mode":"tcp","port":"%s","healthy":%s}\n' \
        "$PROJECT" "$ENV_NAME" "$hp" "$([[ $live == 0 ]] && echo true || echo false)"
    elif [[ $live == 0 ]]; then ok "healthy — something is listening on :$hp (tcp check)"
    else err "unhealthy — nothing listening on :$hp"
    fi
    [[ $live == 0 ]] && return 0 || return 5
  fi

  need curl
  local target="${url%/}$path" curl_args=(-s -o /dev/null -w '%{http_code}' -m "${HEALTH_TIMEOUT:-10}")
  [[ "${E_TLS:-}" == "self-signed" ]] && curl_args+=(-k)
  local accept="${E_HEALTH_ACCEPT:-200}"
  # curl -w '%{http_code}' already prints 000 when the connection fails; a
  # second fallback would concatenate and produce "000000".
  local code; code="$(curl "${curl_args[@]}" "$target" 2>/dev/null)" || true
  [[ -n "$code" ]] || code="000"
  local healthy=1 want
  for want in $accept; do [[ "$code" == "$want" ]] && healthy=0; done
  if [[ "$JSON" == 1 ]]; then
    printf '{"project":"%s","env":"%s","url":"%s","code":"%s","accept":"%s","healthy":%s}\n' \
      "$PROJECT" "$ENV_NAME" "$target" "$code" "$accept" \
      "$([[ $healthy == 0 ]] && echo true || echo false)"
  elif [[ $healthy == 0 ]]; then
    ok "healthy — $target returned $code"
  else
    err "unhealthy — $target returned $code (expected: $accept)"
  fi
  [[ $healthy == 0 ]] && return 0 || return 5
}

# -------------------------------------------------- generic: backup-db -----
db_container() {
  local c="${E_CONTAINERS_DB:-}"
  [[ -n "$c" ]] || return 1
  docker ps --filter "name=^${c}$" --format '{{.Names}}' | head -1
}

generic_backup_db() {
  [[ "${E_DATABASE_ENGINE:-}" == "postgres" ]] || {
    err "no postgres database declared for $ENV_NAME — nothing to back up"; return 3; }
  need docker
  local c; c="$(db_container || true)"
  [[ -n "$c" ]] || { err "database container '${E_CONTAINERS_DB:-?}' is not running — is $ENV_NAME up?"; return 1; }

  local user db
  user="$(docker exec "$c" sh -c 'printf %s "${POSTGRES_USER:-postgres}"')"
  db="$(docker exec "$c" sh -c 'printf %s "${POSTGRES_DB:-$POSTGRES_USER}"')"
  [[ -n "$db" ]] || { err "could not resolve POSTGRES_DB inside $c"; return 1; }

  mkdir -p "$BACKUP_DIR"
  local stamp out tmp
  stamp="$(date +%Y%m%d-%H%M%S)"
  out="$BACKUP_DIR/${db}-${ENV_NAME}-${stamp}.dump"
  tmp="$out.partial"

  note "dumping $db from $c ..."
  if [[ "$DRY" == 1 ]]; then note "would write $out"; return 0; fi
  if ! docker exec "$c" pg_dump -U "$user" -d "$db" -Fc > "$tmp"; then
    rm -f "$tmp"; err "pg_dump failed for $c"; return 1
  fi
  mv "$tmp" "$out"

  # Sidecar: a backup you cannot verify is not a backup.
  local sha size commit engine
  sha="$(os_sha256 "$out")"
  size="$(wc -c < "$out" | tr -d ' ')"
  commit="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  engine="$(docker exec "$c" postgres --version 2>/dev/null | head -1 || echo unknown)"
  cat > "$out.meta.json" <<EOF
{
  "project": "$PROJECT",
  "environment": "$ENV_NAME",
  "database": "$db",
  "container": "$c",
  "engine": "$engine",
  "commit": "$commit",
  "bytes": $size,
  "sha256": "$sha",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "format": "pg_dump -Fc"
}
EOF
  ok "wrote $out ($(du -h "$out" | cut -f1))"

  local keep="${RETENTION:-${E_DATABASE_BACKUP_RETENTION:-0}}"
  if [[ "$keep" -gt 0 ]]; then
    local pruned=0 f
    while IFS= read -r f; do
      [[ -n "$f" ]] || continue
      rm -f "$f" "$f.meta.json"; pruned=$((pruned + 1))
    done < <(ls -1t "$BACKUP_DIR"/"${db}"-"${ENV_NAME}"-*.dump 2>/dev/null | tail -n +"$((keep + 1))")
    [[ "$pruned" -gt 0 ]] && note "pruned $pruned dump(s), keeping newest $keep"
  fi
  return 0
}

generic_restore_db() {
  [[ "${E_DATABASE_ENGINE:-}" == "postgres" ]] || {
    err "no postgres database declared for $ENV_NAME — nothing to restore"; return 3; }
  need docker
  local from="latest" f
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --from) from="${2:-}"; shift 2 ;;
      *) shift ;;
    esac
  done

  local src
  case "$from" in
    latest) src="$(ls -1t "$BACKUP_DIR"/*.dump 2>/dev/null | head -1 || true)" ;;
    prod)   src="$(ls -1t /opt/data/g01-base-infra/database/latest/"$SLUG".dump 2>/dev/null | head -1 || true)" ;;
    *)      src="$from" ;;
  esac
  [[ -n "$src" && -f "$src" ]] || { err "no dump found for --from $from (looked in $BACKUP_DIR)"; return 1; }

  # Guard: refuse a dump taken from a different environment unless forced.
  if [[ -f "$src.meta.json" && "${FORCE_ENV:-0}" != 1 ]]; then
    local senv; senv="$(sed -n 's/.*"environment": *"\([^"]*\)".*/\1/p' "$src.meta.json" | head -1)"
    if [[ -n "$senv" && "$senv" != "$ENV_NAME" ]]; then
      err "$src was taken from '$senv', not '$ENV_NAME'."
      die "Set FORCE_ENV=1 to restore it anyway." 6
    fi
  fi

  local c; c="$(db_container || true)"
  [[ -n "$c" ]] || { err "database container '${E_CONTAINERS_DB:-?}' is not running"; return 1; }
  local user db
  user="$(docker exec "$c" sh -c 'printf %s "${POSTGRES_USER:-postgres}"')"
  db="$(docker exec "$c" sh -c 'printf %s "${POSTGRES_DB:-$POSTGRES_USER}"')"

  confirm "Restore $src into $db ($ENV_NAME)? This replaces current data."
  note "restoring $src into $db ..."
  [[ "$DRY" == 1 ]] && { note "would pg_restore"; return 0; }
  docker exec -i "$c" pg_restore -U "$user" -d "$db" --clean --if-exists --no-owner --no-acl < "$src"
  ok "restored $db from $(basename "$src")"
}

# --------------------------------------------- autostart service writer -----
# Bare-process projects call write_autostart_service from their bindings'
# <env>_autostart_install. The unit is GENERATED, never committed: the one
# committed plist in this fleet points at a directory that does not exist on
# this host, which is exactly the failure mode generating it avoids.
#
#   write_autostart_service <label> <program> [args...]
#
# Three service managers, one interface. A binding says "keep this process
# alive across reboots" and does not care which of them is doing it.
#
# A binding that needs the service to carry environment variables sets
# OPS_SERVICE_ENV before calling:
#
#   OPS_SERVICE_ENV=( "APP_ENV=staging" "APP_CONFIG=$dir/config.json" )
#
# This matters more than it looks. A service started by the OS inherits none
# of the shell environment the operator had, so a unit that omits the two
# variables telling the app which config and which environment it is will
# come up at boot pointing somewhere else entirely — and only at boot, which
# is the worst time to discover it.
write_autostart_service() {
  case "$OPS_OS" in
    mac)     _autostart_write_launchd "$@" ;;
    linux)   _autostart_write_systemd "$@" ;;
    windows) _autostart_write_schtasks "$@" ;;
    *) err "autostart is not supported on this platform ($(uname -s 2>/dev/null))"; return 3 ;;
  esac
}

# Kept because six repos' bindings.sh already call it by this name. It now
# writes whatever the host's service manager is, so those repos gained Linux
# and Windows autostart without editing a line.
write_launchd_plist() { write_autostart_service "$@"; }

_autostart_write_launchd() {
  local label="$1"; shift
  local plist="$HOME/Library/LaunchAgents/$label.plist"
  local logfile="$LOG_DIR/${ENV_NAME}.log"
  if dry; then note "would write $plist and load $label"; return 0; fi
  need launchctl
  mkdir -p "$LOG_DIR" "$(dirname "$plist")"

  local args="" a
  for a in "$@"; do args+="    <string>$a</string>"$'\n'; done

  local envxml="" kv
  for kv in ${OPS_SERVICE_ENV[@]+"${OPS_SERVICE_ENV[@]}"}; do
    envxml+="    <key>${kv%%=*}</key><string>${kv#*=}</string>"$'\n'
  done
  [[ -n "$envxml" ]] && envxml="  <key>EnvironmentVariables</key>"$'\n'"  <dict>"$'\n'"$envxml  </dict>"$'\n'

  cat > "$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array>
$args  </array>
$envxml  <key>WorkingDirectory</key><string>$ROOT</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$logfile</string>
  <key>StandardErrorPath</key><string>$logfile</string>
</dict>
</plist>
PLIST

  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$plist"
  ok "autostart on — $label installed (RunAtLoad + KeepAlive), logging to $logfile"
}

_autostart_write_systemd() {
  local label="$1"; shift
  local unit="$HOME/.config/systemd/user/$label.service"
  local logfile="$LOG_DIR/${ENV_NAME}.log"
  if dry; then note "would write $unit and enable $label"; return 0; fi
  need systemctl
  mkdir -p "$LOG_DIR" "$(dirname "$unit")"

  # systemd does its own quoting: double quotes, with \ and " escaped. This is
  # not shell quoting and printf %q would produce the wrong thing here.
  # No leading space: systemd wants the executable as the first token of the
  # value, and a stray one is at best tolerated and at worst a parse error.
  local execstart="" a q sep=""
  for a in "$@"; do
    q="${a//\\/\\\\}"; q="${q//\"/\\\"}"
    execstart+="$sep\"$q\""; sep=" "
  done

  local envlines="" kv
  for kv in ${OPS_SERVICE_ENV[@]+"${OPS_SERVICE_ENV[@]}"}; do
    q="${kv#*=}"; q="${q//\\/\\\\}"; q="${q//\"/\\\"}"
    envlines+="Environment=\"${kv%%=*}=$q\""$'\n'
  done

  cat > "$unit" <<UNIT
[Unit]
Description=$label
After=network-online.target

[Service]
Type=simple
${envlines}WorkingDirectory=$ROOT
ExecStart=$execstart
Restart=always
RestartSec=10
StandardOutput=append:$logfile
StandardError=append:$logfile

[Install]
WantedBy=default.target
UNIT

  systemctl --user daemon-reload
  systemctl --user enable --now "$label.service"
  ok "autostart on — $label installed (Restart=always), logging to $logfile"
  # A user unit dies with the last session unless lingering is on, which is
  # the difference between "starts at login" and "starts at boot".
  loginctl show-user "$(id -un)" -p Linger 2>/dev/null | grep -q 'Linger=yes' \
    || warn "user lingering is off, so $label starts at login, not at boot: sudo loginctl enable-linger $(id -un)"
}

_autostart_write_schtasks() {
  local label="$1"; shift
  local logfile="$LOG_DIR/${ENV_NAME}.log"
  # schtasks /TR takes a single command line with no redirection, so the
  # redirect has to live inside something. A generated .cmd wrapper is that
  # something, and it also pins the working directory the way the plist's
  # WorkingDirectory and the unit's WorkingDirectory do.
  local wrapper="$LOG_DIR/${label}.cmd"
  if dry; then note "would write $wrapper and register scheduled task $label"; return 0; fi
  need schtasks
  mkdir -p "$LOG_DIR"

  local winroot winlog a
  winroot="$(cygpath -w "$ROOT" 2>/dev/null || echo "$ROOT")"
  winlog="$(cygpath -w "$logfile" 2>/dev/null || echo "$logfile")"

  {
    printf '@echo off\r\n'
    local kv
    for kv in ${OPS_SERVICE_ENV[@]+"${OPS_SERVICE_ENV[@]}"}; do
      printf 'set "%s"\r\n' "$kv"
    done
    printf 'cd /d "%s"\r\n' "$winroot"
    printf '"%s"' "$(cygpath -w "$1" 2>/dev/null || echo "$1")"
    shift
    for a in "$@"; do printf ' "%s"' "$a"; done
    printf ' >> "%s" 2>&1\r\n' "$winlog"
  } > "$wrapper"

  # ONLOGON rather than ONSTART: these are user-scoped services in the fleet,
  # matching launchd's gui/<uid> domain and systemd's --user.
  schtasks //Create //TN "$label" //SC ONLOGON //F \
    //TR "$(cygpath -w "$wrapper" 2>/dev/null || echo "$wrapper")" >/dev/null
  ok "autostart on — scheduled task $label installed (ONLOGON), logging to $logfile"
  warn "Windows has no KeepAlive equivalent here: the task starts the process at logon but will not restart it if it exits."
}

# ------------------------------------------------ generic: backup-files ----
# For projects whose state is files rather than (or as well as) a database:
# append-only logs, uploaded attachments, a JSON store. A database dump alone
# is an incomplete backup for those, so this is a first-class verb.
generic_backup_files() {
  local paths="${E_FILES_PATHS:-}"
  [[ -n "$paths" ]] || { err "no 'files.paths' declared for $ENV_NAME — nothing to back up"; return 3; }
  local dir="${FILES_BACKUP_DIR:-/opt/backups/$PROJECT/files/$ENV_NAME}"
  mkdir -p "$dir"

  local present=() p
  for p in $paths; do
    [[ -e "$p" ]] && present+=("$p") || warn "declared path missing, skipping: $p"
  done
  [[ ${#present[@]} -gt 0 ]] || { err "none of the declared paths exist: $paths"; return 1; }

  local stamp out tmp
  stamp="$(date +%Y%m%d-%H%M%S)"
  out="$dir/${ENV_NAME}-${stamp}.tar.gz"
  tmp="$out.partial"

  note "archiving ${present[*]} ..."
  if [[ "$DRY" == 1 ]]; then note "would write $out"; return 0; fi
  if ! tar -czf "$tmp" -C "$ROOT" "${present[@]}" 2>/dev/null; then
    rm -f "$tmp"; err "tar failed"; return 1
  fi
  mv "$tmp" "$out"

  local sha size commit
  sha="$(os_sha256 "$out")"
  size="$(wc -c < "$out" | tr -d ' ')"
  commit="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  cat > "$out.meta.json" <<EOF
{
  "project": "$PROJECT",
  "environment": "$ENV_NAME",
  "paths": "${present[*]}",
  "commit": "$commit",
  "bytes": $size,
  "sha256": "$sha",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "format": "tar.gz, paths relative to repo root"
}
EOF
  ok "wrote $out ($(du -h "$out" | cut -f1))"

  local keep="${FILES_RETENTION:-${E_FILES_RETENTION:-0}}"
  if [[ "$keep" -gt 0 ]]; then
    local pruned=0 f
    while IFS= read -r f; do
      [[ -n "$f" ]] || continue
      rm -f "$f" "$f.meta.json"; pruned=$((pruned + 1))
    done < <(ls -1t "$dir"/"${ENV_NAME}"-*.tar.gz 2>/dev/null | tail -n +"$((keep + 1))")
    [[ "$pruned" -gt 0 ]] && note "pruned $pruned archive(s), keeping newest $keep"
  fi
  return 0
}

# ------------------------------------------------- generic: autostart ------
generic_autostart() {
  local action="${1:-status}" mode="${E_AUTOSTART:-none}"
  case "$mode" in
    docker)
      need docker
      local names="${E_CONTAINERS_APP:-} ${E_CONTAINERS_DB:-}" n
      case "$action" in
        on|off)
          local policy; policy=$([[ "$action" == on ]] && echo unless-stopped || echo no)
          for n in $names; do
            [[ -n "$n" ]] || continue
            run docker update --restart="$policy" "$n" >/dev/null 2>&1 \
              && note "$n → restart=$policy" || warn "$n: not running, policy unchanged"
          done
          ok "autostart $action (docker restart policy)"
          warn "compose files still hold the declared policy — update them to make this survive a recreate."
          ;;
        status)
          local pol
          for n in $names; do
            [[ -n "$n" ]] || continue
            pol="$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$n" 2>/dev/null)" || pol=""
            printf '%-40s %s\n' "$n" "${pol:-(not created)}"
          done ;;
        *) err "autostart takes on|off|status"; return 2 ;;
      esac ;;
    # `service` is the platform-neutral name; `launchd` is the spelling the
    # manifests were written with when the mini was the only host, and still
    # means the same thing — keep this process alive across reboots, using
    # whatever service manager this machine has.
    service|launchd)
      local label="com.customapplab.$PROJECT.$ENV_NAME"
      case "$action" in
        on)
          have "${ENV_NAME}_autostart_install" \
            && "${ENV_NAME}_autostart_install" \
            || { err "service autostart needs ${ENV_NAME}_autostart_install in bindings.sh"; return 3; } ;;
        off)
          case "$OPS_OS" in
            mac)
              local plist="$HOME/Library/LaunchAgents/$label.plist"
              [[ -f "$plist" ]] && { need launchctl
                run launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
                run rm -f "$plist"; ok "autostart off — $label removed"; } || note "no $label installed" ;;
            linux)
              local unit="$HOME/.config/systemd/user/$label.service"
              [[ -f "$unit" ]] && { need systemctl
                run systemctl --user disable --now "$label.service" 2>/dev/null || true
                run rm -f "$unit"; run systemctl --user daemon-reload
                ok "autostart off — $label removed"; } || note "no $label installed" ;;
            windows)
              need schtasks
              if schtasks //Query //TN "$label" >/dev/null 2>&1; then
                run schtasks //Delete //TN "$label" //F >/dev/null
                ok "autostart off — scheduled task $label removed"
              else note "no $label installed"; fi ;;
            *) err "autostart is not supported on this platform"; return 3 ;;
          esac ;;
        status)
          case "$OPS_OS" in
            mac)
              need launchctl
              if launchctl print "gui/$(id -u)/$label" >/dev/null 2>&1; then ok "$label loaded"
              else printf '%s not loaded\n' "$label"; return 1; fi ;;
            linux)
              need systemctl
              if systemctl --user is-enabled "$label.service" >/dev/null 2>&1; then
                ok "$label enabled ($(systemctl --user is-active "$label.service" 2>/dev/null))"
              else printf '%s not enabled\n' "$label"; return 1; fi ;;
            windows)
              need schtasks
              if schtasks //Query //TN "$label" >/dev/null 2>&1; then ok "$label registered"
              else printf '%s not registered\n' "$label"; return 1; fi ;;
            *) err "autostart is not supported on this platform"; return 3 ;;
          esac ;;
        *) err "autostart takes on|off|status"; return 2 ;;
      esac ;;
    none) err "this project declares autostart: none for $ENV_NAME"; return 3 ;;
    *) err "unknown autostart mode '$mode'"; return 1 ;;
  esac
}

# ---------------------------------------------------- generic: doctor ------
generic_doctor() {
  local problems=0 warnings=0
  printf '%s (%s)\n' "$PROJECT" "$ENV_NAME"

  chk() { printf '  %-46s %s\n' "$1" "$2"; }
  bad() { chk "$1" "${RED}FAIL${NC} $2"; problems=$((problems+1)); }
  soft(){ chk "$1" "${YEL}WARN${NC} $2"; warnings=$((warnings+1)); }
  good(){ chk "$1" "${GRN}ok${NC} $2"; }

  chk "platform" "$OPS_OS ($(uname -s 2>/dev/null || echo unknown))"
  [[ "$OPS_OS" == unknown ]] && soft "platform" "unrecognised; assuming POSIX tools"

  # Required tools. `requires` lists what every platform needs; an optional
  # `requires_<os>` block adds what only that one does — a manifest that
  # demands lsof everywhere fails a Windows host for a tool it will never
  # have and does not need, because os_port_pids uses netstat there.
  local t reqs="${E_REQUIRES:-}"
  case "$OPS_OS" in
    mac)     reqs="$reqs ${E_REQUIRES_MAC:-}" ;;
    linux)   reqs="$reqs ${E_REQUIRES_LINUX:-}" ;;
    windows) reqs="$reqs ${E_REQUIRES_WINDOWS:-}" ;;
  esac
  for t in $reqs; do
    command -v "$t" >/dev/null 2>&1 && good "tool: $t" "" || bad "tool: $t" "not on PATH"
  done

  # config file
  if [[ -n "${E_CONFIG:-}" ]]; then
    local cfg="$E_CONFIG"
    [[ "$cfg" == /* ]] || cfg="$CONFIG_DIR/$cfg"
    E_CONFIG="$cfg"
    if [[ -f "$E_CONFIG" ]]; then
      local mode; mode="$(os_file_mode "$E_CONFIG")"
      case "$mode" in
        600)   good "config: $E_CONFIG" "mode $mode" ;;
        n/a)   chk  "config: $E_CONFIG" "present (Windows: ACLs, no POSIX mode)" ;;
        *)     soft "config: $E_CONFIG" "mode $mode, expected 600" ;;
      esac
    else
      bad "config: $E_CONFIG" "missing"
    fi
  fi

  # ops-layer config
  if [[ -f "$CICD_ENV_FILE" ]]; then
    local m2; m2="$(os_file_mode "$CICD_ENV_FILE")"
    case "$m2" in
      600)   good "ops config: $CICD_ENV_FILE" "mode $m2" ;;
      n/a)   chk  "ops config: $CICD_ENV_FILE" "present (Windows: ACLs, no POSIX mode)" ;;
      *)     soft "ops config: $CICD_ENV_FILE" "mode $m2, expected 600" ;;
    esac
  else
    soft "ops config: $CICD_ENV_FILE" "not present (optional)"
  fi

  # ports
  local p
  for p in ${E_PORTS:-}; do
    if os_port_busy "$p"; then
      chk "port $p" "in use (expected if $ENV_NAME is up)"
    else
      good "port $p" "free"
    fi
  done

  # directories
  local d
  for d in "$LOG_DIR" "${E_DATABASE_DATA_DIR:-}"; do
    [[ -n "$d" ]] || continue
    if [[ -d "$d" ]]; then
      [[ -w "$d" ]] && good "dir: $d" "writable" || bad "dir: $d" "not writable"
    else
      soft "dir: $d" "does not exist yet"
    fi
  done

  # disk
  # /opt is the fleet convention, but a Windows checkout lives on J:\ and
  # has no /opt at all — report the volume the checkout is actually on there.
  local dtarget="/opt"
  [[ -d "$dtarget" ]] || dtarget="$ROOT"
  local avail; avail="$(df -h "$dtarget" 2>/dev/null | awk 'NR==2{print $4}')"
  [[ -n "$avail" ]] && chk "disk free on $dtarget" "$avail"

  # compose restart policy vs manifest
  if compose_declared && [[ "${E_AUTOSTART:-}" == "docker" ]]; then
    # `restart: "no"` on a one-shot migration sidecar is not an autostart
    # policy — only always / unless-stopped / on-failure bring a service back.
    local f found=0
    for f in $E_COMPOSE_FILES; do
      [[ -f "$f" ]] && grep -Eq '^[[:space:]]*restart:[[:space:]]*"?(always|unless-stopped|on-failure)' "$f" && found=1
    done
    [[ "$found" == 1 ]] && good "compose restart policy" "declared" \
                        || soft "compose restart policy" "manifest says autostart: docker but no service has always/unless-stopped/on-failure"
  fi

  printf '\n'
  if [[ "$problems" -gt 0 ]]; then
    err "$problems problem(s), $warnings warning(s)"; return 1
  fi
  ok "no problems ($warnings warning(s))"
}

# ------------------------------------------------------------- prod ---------
dispatch_prod() {
  local action="${1:-}"; shift || true
  local tag="${1:-}" wf=""
  case "$action" in
    deploy)     wf="${E_WORKFLOWS_DEPLOY:-}" ;;
    rollback)   wf="${E_WORKFLOWS_ROLLBACK:-}" ;;
    build)      wf="${E_WORKFLOWS_BUILD:-}" ;;
    status)     wf="${E_WORKFLOWS_STATUS:-}" ;;
    migrate)    wf="${E_WORKFLOWS_MIGRATE:-}" ;;
    backup-db)  wf="${E_WORKFLOWS_BACKUP_DB:-}" ;;
    restore-db) wf="${E_WORKFLOWS_RESTORE_DB:-}" ;;
    health)     generic_health; return $? ;;
    *) err "unknown prod verb '$action'"; usage ;;
  esac
  [[ -n "$wf" ]] || { err "prod $action is not configured for this project (no workflow in $MANIFEST)."; return 3; }
  need gh

  local repo="${P_REPO:-}" cmd=(gh workflow run "$wf")
  [[ -n "$repo" ]] && cmd+=(-R "$repo")
  cmd+=(--ref "${REF:-${P_DEFAULT_BRANCH:-main}}")
  if [[ -n "$tag" && -n "${E_TAG_INPUT:-}" ]]; then
    cmd+=(-f "${E_TAG_INPUT}=$tag")
  elif [[ -n "$tag" ]]; then
    warn "--- this workflow takes no tag input; ignoring '$tag'"
  fi

  confirm "Dispatch $wf against PRODUCTION${repo:+ ($repo)}?"
  note "→ ${cmd[*]}"
  run "${cmd[@]}" || { err "dispatch failed"; return 1; }
  ok "dispatched $wf"
  [[ "$DRY" == 1 ]] && return 0
  sleep 3
  gh run list ${repo:+-R "$repo"} -w "$wf" -L 1 \
     --json displayTitle,status,url -q '.[] | "  \(.status)  \(.displayTitle)\n  \(.url)"' 2>/dev/null || true
}

# --------------------------------------------------------------- bindings ---
# shellcheck source=/dev/null
[[ -f "$CICD/bindings.sh" ]] && source "$CICD/bindings.sh"

# ------------------------------------------------------------- dispatch -----
if [[ "$ENV_NAME" == "prod" ]]; then
  dispatch_prod "$VERB" "$@"
  exit $?
fi

# Destructive verbs are guarded HERE, before anything is dispatched — a
# binding may delegate straight to a script that deletes a host directory
# (several repos' `down.sh --wipe` do exactly that), so the guard cannot live
# inside the generic implementations alone.
case "$VERB" in
  wipe|restore-db)
    if [[ "$DRY" == 1 ]]; then
      err "--dry-run cannot be honoured for '$VERB': it delegates to project scripts that do not support it."
      die "Refusing to run a destructive verb under --dry-run." 6
    fi
    confirm "$VERB will destroy $ENV_NAME data for $PROJECT. Continue?"
    ;;
esac

fn="${ENV_NAME}_${VERB//-/_}"
if have "$fn"; then
  # A binding is project code, so --dry-run only means anything if that code
  # routes its commands through run(). A repo opts in by setting
  # OPS_DRY_RUN_SAFE=1 in .cicd/bindings.sh once every verb does. Without the
  # opt-in, refuse — a binding that ignores DRY would do the real thing while
  # reporting a dry run, which is worse than not offering the flag.
  if [[ "$DRY" == 1 && "${OPS_DRY_RUN_SAFE:-0}" != 1 ]]; then
    err "--dry-run is not supported for '$ENV_NAME $VERB': ${fn}() in .cicd/bindings.sh does not route its commands through run()."
    die "Convert it to run(), then set OPS_DRY_RUN_SAFE=1 in bindings.sh." 6
  fi
  "$fn" "$@"
  exit $?
fi

case "$VERB" in
  health)     generic_health "$@" ;;
  backup-db)    generic_backup_db "$@" ;;
  backup-files) generic_backup_files "$@" ;;
  restore-db) generic_restore_db "$@" ;;
  autostart)  generic_autostart "$@" ;;
  doctor)     generic_doctor "$@" ;;
  status)     compose_declared && dc ps "$@" || { err "'$ENV_NAME status' is not supported in this project."; exit 3; } ;;
  logs)       compose_declared && dc logs -f "$@" || { err "'$ENV_NAME logs' is not supported in this project."; exit 3; } ;;
  restart)    compose_declared && dc restart "$@" || { err "'$ENV_NAME restart' is not supported in this project."; exit 3; } ;;
  up|down|wipe)
    err "'$ENV_NAME $VERB' is not supported in this project."
    note "Define ${fn}() in .cicd/bindings.sh to add it."
    exit 3 ;;
  *) err "unknown verb '$VERB'"; usage ;;
esac

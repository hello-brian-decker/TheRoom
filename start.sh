#!/usr/bin/env bash
#
# The Room - start script
#
# Usage:
#   ./start.sh              Start the Vite dev server (default)
#   ./start.sh dev          Same as above
#   ./start.sh build        Production build into dist/
#   ./start.sh preview      Build, then serve the production bundle
#   ./start.sh electron     Run the Electron desktop app against the dev server
#   ./start.sh --help       Show this help
#
# Environment:
#   PORT    Override the dev/preview port (default 7878, from vite.config.js)
#   HOST    Override the bind address (default 0.0.0.0)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

MIN_NODE_MAJOR=18
MODE="${1:-dev}"

info()  { printf '\033[0;36m==>\033[0m %s\n' "$*"; }
warn()  { printf '\033[0;33mwarning:\033[0m %s\n' "$*" >&2; }
fail()  { printf '\033[0;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
    # Print the leading comment block (everything after the shebang, up to the
    # first non-comment line).
    awk 'NR == 1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "${BASH_SOURCE[0]}"
}

check_node() {
    command -v node >/dev/null 2>&1 || fail "Node.js is not installed. Install Node.js v${MIN_NODE_MAJOR}+ from https://nodejs.org"
    command -v npm  >/dev/null 2>&1 || fail "npm is not installed (it normally ships with Node.js)."

    local major
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [ "$major" -lt "$MIN_NODE_MAJOR" ]; then
        fail "Node.js v${MIN_NODE_MAJOR}+ is required, found $(node -v)."
    fi
    info "Node $(node -v), npm v$(npm -v)"
}

# Install dependencies if they are missing or older than the lockfile.
check_deps() {
    if [ ! -d node_modules ]; then
        info "Installing dependencies (this may take a minute)..."
        npm install
    elif [ package-lock.json -nt node_modules ]; then
        info "package-lock.json changed since last install, updating dependencies..."
        npm install
    else
        info "Dependencies are up to date"
    fi
}

# Build the vite CLI flags for the port/host overrides, if any were given.
server_flags() {
    local flags=()
    [ -n "${PORT:-}" ] && flags+=(--port "$PORT")
    [ -n "${HOST:-}" ] && flags+=(--host "$HOST")
    printf '%s\n' "${flags[@]:-}"
}

run_dev() {
    local flags=()
    while IFS= read -r line; do [ -n "$line" ] && flags+=("$line"); done < <(server_flags)

    info "Starting dev server on http://localhost:${PORT:-7878}"
    info "Press Ctrl+C to stop."
    exec npx vite "${flags[@]}"
}

run_build() {
    info "Building for production..."
    npm run build
    info "Build complete: ${ROOT_DIR}/dist"
}

run_preview() {
    local flags=()
    while IFS= read -r line; do [ -n "$line" ] && flags+=("$line"); done < <(server_flags)

    run_build
    info "Serving the production build..."
    exec npx vite preview "${flags[@]}"
}

run_electron() {
    # src/main.js hardcodes http://localhost:5173 as the dev URL, so the dev
    # server has to listen there rather than on the usual 7878.
    local port=5173

    if [ ! -f src/main.js ]; then
        fail "src/main.js not found - cannot launch the Electron main process."
    fi
    if [ -n "${PORT:-}" ] && [ "$PORT" != "$port" ]; then
        warn "PORT=${PORT} ignored: src/main.js loads http://localhost:${port} in development."
    fi

    # main.js only loads the dev server when NODE_ENV=development; otherwise it
    # falls back to dist/index.html, which does not exist until a build runs.
    info "Starting Vite and Electron together on port ${port}..."
    exec npx concurrently --kill-others --names "vite,electron" --prefix-colors "cyan,magenta" \
        "npx vite --port ${port} --strictPort" \
        "npx wait-on http://localhost:${port} && NODE_ENV=development npx electron ."
}

case "$MODE" in
    -h|--help|help)
        usage
        exit 0
        ;;
    dev|build|preview|electron)
        ;;
    *)
        fail "Unknown mode '${MODE}'. Run './start.sh --help' for usage."
        ;;
esac

check_node
check_deps

case "$MODE" in
    dev)      run_dev ;;
    build)    run_build ;;
    preview)  run_preview ;;
    electron) run_electron ;;
esac

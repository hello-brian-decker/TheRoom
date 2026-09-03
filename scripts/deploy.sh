#!/usr/bin/env bash
# deploy.sh — compatibility shim. Real entrypoint: .cicd/ops.sh
# See: g01-base-infra/docs/fleet-operations.md
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec .cicd/ops.sh "$@"

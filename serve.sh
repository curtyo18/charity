#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "Serving $(pwd) at http://localhost:${PORT}/"
exec python3 -m http.server "${PORT}"

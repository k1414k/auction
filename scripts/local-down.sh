#!/bin/sh
set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not available. Install Docker Desktop, then run this again." >&2
  exit 1
fi

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE=".env.local.example"
fi

docker compose --env-file "$ENV_FILE" -f docker-compose.local.yml down

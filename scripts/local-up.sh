#!/bin/sh
set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=".env.local"
ENV_EXAMPLE=".env.local.example"

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not available. Install Docker Desktop, then run this again." >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "$ENV_EXAMPLE is missing. The local environment template must exist in the repository root." >&2
    exit 1
  fi

  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created $ENV_FILE from $ENV_EXAMPLE"
fi

echo "Starting local Docker environment..."
echo "Frontend: http://localhost:3001"
echo "Admin:    http://localhost:3003"
echo "API:      http://localhost:3000/health"
echo ""

docker compose --env-file "$ENV_FILE" -f docker-compose.local.yml up --build

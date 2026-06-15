#!/bin/sh
set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not available. Install Docker Engine and the Docker Compose plugin first." >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo ".env is missing. Copy .env.example to .env and fill the required values first." >&2
  exit 1
fi

if grep -q "CHANGE_ME" .env; then
  echo ".env still contains CHANGE_ME placeholders. Fill production values first." >&2
  exit 1
fi

COMPOSE="docker compose --env-file .env -f docker-compose.yml"

echo "Building production images..."
$COMPOSE build
echo "Preparing database..."
$COMPOSE run --rm backend bundle exec rails db:prepare
echo "Starting production containers..."
$COMPOSE up -d
$COMPOSE ps

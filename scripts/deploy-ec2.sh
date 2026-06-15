#!/bin/sh
set -eu

if [ ! -f .env ]; then
  echo ".env is missing. Copy .env.example to .env and fill the required values first." >&2
  exit 1
fi

if grep -q "CHANGE_ME" .env; then
  echo ".env still contains CHANGE_ME placeholders. Fill production values first." >&2
  exit 1
fi

COMPOSE="docker compose --env-file .env -f docker-compose.yml"

$COMPOSE build
$COMPOSE run --rm backend bundle exec rails db:prepare
$COMPOSE up -d
$COMPOSE ps

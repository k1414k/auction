#!/bin/sh
set -eu

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  cp .env.local.example "$ENV_FILE"
  echo "Created $ENV_FILE from .env.local.example"
fi

docker compose --env-file "$ENV_FILE" -f docker-compose.local.yml up --build

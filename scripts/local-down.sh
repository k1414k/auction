#!/bin/sh
set -eu

docker compose --env-file .env.local -f docker-compose.local.yml down

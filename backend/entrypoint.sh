#!/bin/bash
# Railsコンテナが起動するときに最初に実行されるスクリプト
# データベースのマイグレーションを行ってからサーバーを起動する

set -e  # コマンドが失敗したら即座に終了する

# Railsが前回クラッシュしたときに残るpidファイルを削除する
# これがないと「サーバーはすでに起動中」エラーが出る
rm -f /app/tmp/pids/server.pid

# データベースが起動するまで少し待つ（Docker起動順序のズレ対策）
echo "Waiting for database to be ready..."
sleep 3

# データベースが存在しなければ作成する（初回起動時）
bundle exec rails db:create 2>/dev/null || true

# マイグレーションを実行する（テーブル構造を最新状態にする）
echo "Running database migrations..."
bundle exec rails db:migrate

# 渡されたコマンド（CMD）を実行する → rails server が起動する
exec "$@"

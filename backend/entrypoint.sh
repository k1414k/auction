#!/bin/sh
# Railsコンテナが起動するときに最初に実行されるスクリプト

set -e  # コマンドが失敗したら即座に終了する

# Railsが前回クラッシュしたときに残るpidファイルを削除する
# これがないと「サーバーはすでに起動中」エラーが出る
rm -f /app/tmp/pids/server.pid

# 渡されたコマンド（CMD）を実行する → rails server が起動する
exec "$@"

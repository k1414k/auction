# Dockerでローカル開発環境とEC2本番環境を立ち上げる手順

このリポジトリは、Docker Composeで次の4つをまとめて起動します。

```text
backend   Rails API
frontend  Next.js ユーザー画面
admin     Nuxt 管理画面
db        PostgreSQL
```

EC2本番では、さらにCaddyがHTTPSの入口になります。

```text
ブラウザ -> Caddy -> frontend / admin / backend
```

## まず覚えること

ローカル開発とEC2本番では使うファイルが違います。

| 用途 | Compose | 環境変数 | 起動スクリプト |
| --- | --- | --- | --- |
| ローカル開発 | `docker-compose.local.yml` | `.env.local` | `scripts/local-up.sh` |
| EC2本番 | `docker-compose.yml` | `.env` | `scripts/deploy-ec2.sh` |

`.env.local` と `.env` は個人環境や秘密情報を含むためGitに入れません。

テンプレートの `.env.local.example` / `.env.example` からコピーして使います。

## ローカル開発を起動する

### 1. 必要なもの

- Docker Desktop
- このリポジトリのコード

### 2. 起動コマンド

リポジトリのルートで実行します。

```bash
./scripts/local-up.sh
```

`sh scripts/local-up.sh` でも動きます。

また、誤って `scripts` ディレクトリ内で `sh ./local-up.sh` と実行しても、リポジトリのルートを自動判定します。

初回実行時に `.env.local` が無ければ、`.env.local.example` から自動で作られます。

```text
.env.local.example -> .env.local
```

初回はDocker imageのビルドとnpm/bundle installが走るため、数分かかることがあります。

### 3. 開くURL

起動できたらブラウザで開きます。

| 画面 | URL |
| --- | --- |
| ユーザー画面 | http://localhost:3001 |
| 管理画面 | http://localhost:3003 |
| APIヘルスチェック | http://localhost:3000/health |

APIヘルスチェックで次のように返ればbackendは起動しています。

```json
{"status":"ok"}
```

### 4. 停止コマンド

別ターミナルで次を実行します。

```bash
./scripts/local-down.sh
```

`local-up.sh` を実行しているターミナルで `Ctrl + C` しても停止できます。念のため完全に止めたい時は `local-down.sh` を使います。

## ローカルでよく変える設定

通常は `.env.local` を編集しなくても動きます。

ただし、PC上で既にPostgreSQLが `5432` を使っている場合は、`.env.local` の `DATABASE_PORT` を変更してください。

```env
DATABASE_PORT=5433
```

変更後に起動し直します。

```bash
./scripts/local-down.sh
./scripts/local-up.sh
```

## ローカルでよく使うコマンド

```bash
# 起動
./scripts/local-up.sh

# 停止
./scripts/local-down.sh

# コンテナ状態確認
docker compose --env-file .env.local -f docker-compose.local.yml ps

# backendログ
docker compose --env-file .env.local -f docker-compose.local.yml logs -f backend

# frontendログ
docker compose --env-file .env.local -f docker-compose.local.yml logs -f frontend

# adminログ
docker compose --env-file .env.local -f docker-compose.local.yml logs -f admin

# Rails console
docker compose --env-file .env.local -f docker-compose.local.yml exec backend bundle exec rails console
```

## EC2本番環境を起動する

EC2本番では、Caddyが3つのドメインをHTTPSで受けて各サービスへ振り分けます。

```text
auction.example.com -> frontend
admin.example.com   -> admin
api.example.com     -> backend
```

### 1. AWS側で準備するもの

EC2のSecurity Groupで次を開けます。

```text
22/tcp   SSH
80/tcp   HTTP。Caddyの証明書発行で必要
443/tcp  HTTPS
```

DNSのAレコードをEC2のPublic IPへ向けます。

```text
auction.example.com -> EC2 Public IP
admin.example.com   -> EC2 Public IP
api.example.com     -> EC2 Public IP
```

EC2にはDocker EngineとDocker Compose pluginをインストールしておきます。

確認コマンド:

```bash
docker --version
docker compose version
```

### 2. EC2にコードを置く

例:

```bash
git clone <repository-url>
cd auction
```

更新デプロイの場合は、既存ディレクトリで次を実行します。

```bash
git pull
```

### 3. `.env` を作る

EC2上でリポジトリのルートに移動して、テンプレートをコピーします。

```bash
cp .env.example .env
```

次の値は必ず本番用に変更します。

```env
FRONTEND_DOMAIN=auction.example.com
ADMIN_DOMAIN=admin.example.com
API_DOMAIN=api.example.com
CADDY_EMAIL=your-email@example.com

RAILS_MASTER_KEY=...
SECRET_KEY_BASE=...
DATABASE_PASSWORD=strong-password

APP_HOST=api.example.com
RAILS_HOSTS=api.example.com
RAILS_INTERNAL_HOSTS=backend
FRONTEND_ORIGINS=https://auction.example.com,https://admin.example.com

NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_API_HOST=api.example.com
NUXT_PUBLIC_API_BASE=https://api.example.com
```

`RAILS_MASTER_KEY` は `backend/config/credentials.yml.enc` を読むための鍵です。分からない場合は、このRails credentialsを作った人またはリポジトリ管理者に確認してください。

`SECRET_KEY_BASE` はEC2上で生成できます。

```bash
docker run --rm ruby:3.2.4 ruby -rsecurerandom -e 'puts SecureRandom.hex(64)'
```

### 4. デプロイする

`.env` の設定後に実行します。

```bash
./scripts/deploy-ec2.sh
```

このスクリプトは次を順番に実行します。

```bash
docker compose --env-file .env -f docker-compose.yml build
docker compose --env-file .env -f docker-compose.yml run --rm backend bundle exec rails db:prepare
docker compose --env-file .env -f docker-compose.yml up -d
docker compose --env-file .env -f docker-compose.yml ps
```

### 5. 動作確認

```bash
curl https://api.example.com/health
docker compose --env-file .env -f docker-compose.yml ps
docker compose --env-file .env -f docker-compose.yml logs -f caddy
```

`curl` が次を返せばbackendは起動しています。

```json
{"status":"ok"}
```

## EC2でよく使うコマンド

```bash
# デプロイ
./scripts/deploy-ec2.sh

# 状態確認
docker compose --env-file .env -f docker-compose.yml ps

# backendログ
docker compose --env-file .env -f docker-compose.yml logs -f backend

# Caddyログ。HTTPS証明書の問題を見る時に使う
docker compose --env-file .env -f docker-compose.yml logs -f caddy

# Rails console
docker compose --env-file .env -f docker-compose.yml exec backend bundle exec rails console

# 停止。volumeは消さない
docker compose --env-file .env -f docker-compose.yml down
```

## 本番データの保存場所

EC2本番ではDocker volumeにデータを保存します。

| volume | 中身 |
| --- | --- |
| `postgres_data` | PostgreSQLのDBデータ |
| `rails_storage` | Active Storageのローカルアップロード画像 |
| `caddy_data` | HTTPS証明書 |
| `caddy_config` | Caddy設定キャッシュ |

本番で次のコマンドは実行しないでください。

```bash
docker compose down -v
```

`-v` を付けるとDB、アップロード画像、HTTPS証明書のvolumeが消えます。

## S3を使う場合

EC2単体で簡単に始めるなら、`.env` はこのままで動きます。

```env
ACTIVE_STORAGE_SERVICE=local
```

S3に切り替える場合は `.env` を変更します。

```env
ACTIVE_STORAGE_SERVICE=amazon
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

長期運用ではアクセスキーを `.env` に置くより、EC2 IAM Roleを使う構成が安全です。

## 困った時

### `cp: .env.local.example: No such file or directory`

古いスクリプトでは、実行した場所によって `.env.local.example` を見つけられませんでした。今はリポジトリのルートを自動判定します。

次のどちらでも起動できます。

```bash
./scripts/local-up.sh
sh scripts/local-up.sh
```

### `port is already allocated`

同じポートを別アプリが使っています。

ローカルPostgreSQLの `5432` が原因なら `.env.local` を変更します。

```env
DATABASE_PORT=5433
```

`3000`、`3001`、`3003` が使われている場合は、そのプロセスを止めてから再実行してください。

### EC2でHTTPSにならない

まずDNSがEC2のPublic IPを向いているか確認します。

```bash
dig +short api.example.com
```

次にCaddyログを見ます。

```bash
docker compose --env-file .env -f docker-compose.yml logs -f caddy
```

Security Groupで `80/tcp` と `443/tcp` が開いていない場合も証明書発行に失敗します。

### `.env still contains CHANGE_ME placeholders`

`.env` に本番用の値がまだ入っていません。`CHANGE_ME` を含む値をすべて変更してから再実行してください。

# ローカル開発とEC2本番環境の使い分け

## 使うファイル

```text
ローカル開発:
  docker-compose.local.yml
  .env.local
  .env.local.example
  scripts/local-up.sh
  scripts/local-down.sh

EC2本番:
  docker-compose.yml
  .env
  .env.example
  deploy/Caddyfile
  scripts/deploy-ec2.sh
```

## ローカル開発

ローカルは hot reload 前提です。Caddy は使わず、各サービスを localhost のポートで直接開きます。

```text
backend   http://localhost:3000
frontend  http://localhost:3001
admin     http://localhost:3003
postgres  localhost:5432
```

### 起動

初回からこの1コマンドで起動できます。

```bash
./scripts/local-up.sh
```

`.env.local` が無い場合は `.env.local.example` から自動作成します。

### 停止

```bash
./scripts/local-down.sh
```

### ローカルで変更する可能性がある値

通常はそのままで動きます。必要なら `.env.local` を編集します。

```env
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
FRONTEND_ORIGINS=http://localhost:3001,http://localhost:3003
```

すでにホスト側で PostgreSQL が `5432` を使っている場合は、`.env.local` の `DATABASE_PORT` を `5433` などに変えてください。

## EC2本番

本番は build 済みアプリを Caddy で HTTPS 公開します。

```text
frontend domain -> Caddy -> frontend:3001
admin domain    -> Caddy -> admin:3003
api domain      -> Caddy -> backend:3000
```

### 事前にAWS/ドメイン側で設定するもの

1. EC2 Security Group

```text
22/tcp   SSH
80/tcp   HTTP。Caddy の証明書発行にも必要
443/tcp  HTTPS
```

2. DNS A record

`.env` に書く3つのドメインを EC2 の public IP に向けます。

```text
auction.jongin.blog -> EC2 public IP
admin.jongin.blog   -> EC2 public IP
api.jongin.blog     -> EC2 public IP
```

3. EC2 に Docker Engine と Docker Compose plugin をインストール

### EC2上で設定するファイル

`.env.example` を `.env` にコピーして編集します。

```bash
cp .env.example .env
```

本番で必ず設定する値:

```env
FRONTEND_DOMAIN=auction.jongin.blog
ADMIN_DOMAIN=admin.jongin.blog
API_DOMAIN=api.jongin.blog
CADDY_EMAIL=your-email@example.com

RAILS_MASTER_KEY=...
SECRET_KEY_BASE=...
APP_HOST=api.jongin.blog
RAILS_HOSTS=api.jongin.blog
FRONTEND_ORIGINS=https://auction.jongin.blog,https://admin.jongin.blog

DATABASE_PASSWORD=strong-password

NEXT_PUBLIC_API_BASE_URL=https://api.jongin.blog
NEXT_PUBLIC_API_HOST=api.jongin.blog
NUXT_PUBLIC_API_BASE=https://api.jongin.blog
```

`RAILS_MASTER_KEY` は `backend/config/credentials.yml.enc` 用の鍵です。  
`SECRET_KEY_BASE` は以下で生成できます。

```bash
docker run --rm ruby:3.2.4 ruby -rsecurerandom -e 'puts SecureRandom.hex(64)'
```

### EC2で起動

`.env` を設定した後は、この1コマンドです。

```bash
./scripts/deploy-ec2.sh
```

このスクリプトは以下を実行します。

```bash
docker compose --env-file .env -f docker-compose.yml build
docker compose --env-file .env -f docker-compose.yml run --rm backend bundle exec rails db:prepare
docker compose --env-file .env -f docker-compose.yml up -d
docker compose --env-file .env -f docker-compose.yml ps
```

### 動作確認

```bash
curl https://api.jongin.blog/health
docker compose --env-file .env -f docker-compose.yml ps
docker compose --env-file .env -f docker-compose.yml logs -f caddy
```

`https://api.jongin.blog/health` が `{"status":"ok"}` を返せば backend は起動しています。

## 本番でS3を使う場合

単一EC2で簡単に始めるなら `ACTIVE_STORAGE_SERVICE=local` のままで動きます。画像は Docker volume の `rails_storage` に保存されます。

S3へ切り替える場合は `.env` を変更します。

```env
ACTIVE_STORAGE_SERVICE=amazon
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

長期運用では access key を `.env` に置くより、EC2 IAM Role に寄せる方が安全です。

## よく使うコマンド

ローカル:

```bash
./scripts/local-up.sh
./scripts/local-down.sh
docker compose --env-file .env.local -f docker-compose.local.yml logs -f backend
```

本番:

```bash
./scripts/deploy-ec2.sh
docker compose --env-file .env -f docker-compose.yml ps
docker compose --env-file .env -f docker-compose.yml logs -f backend
docker compose --env-file .env -f docker-compose.yml exec backend bundle exec rails console
```

## 注意

- 本番で `docker compose down -v` は使わないでください。DB、アップロード画像、Caddy証明書の volume が消えます。
- 初回HTTPS発行前に DNS が EC2 public IP を向いている必要があります。
- `.env` は秘密情報を含むので Git に commit しないでください。
- admin は現時点ではブラウザから Rails API を直接呼びます。将来的には Nuxt server route 経由の BFF 化がより安全です。

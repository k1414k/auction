# 変更点とEC2デプロイ手順

作成日: 2026-06-13

## 主な変更点

### セキュリティ改善

- `auction/v1/items#update` / `destroy` を認証必須にし、出品者本人だけが更新・削除できるようにしました。
- `auction/v1/user/wallet` は売上からポイントへチャージする `type=charge` のみに制限しました。ユーザーが任意に `balance` / `points` を増減できる経路を閉じています。
- `admin` の管理者 token を `localStorage` に永続保存しないようにしました。リロード後は再ログインが必要です。
- `admin/src/lib/debugLog.ts` の固定ローカル debug endpoint 送信を廃止し、development の `console.debug` のみにしました。
- `Item` の画像枚数制限 validation を有効化しました。
- `favorites` にモデル validation と DB unique index を追加し、同一ユーザーの同一商品 favorite 重複を防ぎます。

### Docker / デプロイ改善

- ルート `docker-compose.yml` を追加しました。
- Caddy を追加し、`auction` / `admin` / `api` の3ドメインを HTTPS で reverse proxy できるようにしました。
- `backend/Dockerfile` を multi-stage 化し、実行ユーザーを非 root にしました。
- `frontend/Dockerfile` と `admin/Dockerfile` を `npm ci` 前提に整理しました。
- `frontend/pnpm-lock.yaml` を削除し、frontend/admin とも npm lockfile に統一しました。
- `backend/core-api*.Dockerfile` を削除しました。旧リポジトリを build 中に clone する構成は統合リポジトリでは使いません。
- Rails container 起動時の自動 `db:create` / `db:migrate` を廃止しました。migration は deploy step で明示実行します。
- `scripts/deploy-ec2.sh` を追加しました。

### 設定整理

- ルート `.env.example` を追加しました。
- ルート `.gitignore` を追加しました。
- ルート `README.md` を追加しました。
- Rails production 設定で `RAILS_MASTER_KEY` を必須化できるようにしました。
- Rails production の Active Storage は `ACTIVE_STORAGE_SERVICE=local|amazon` で切り替えます。
- admin の API base 環境変数は `NUXT_PUBLIC_API_BASE` に寄せ、旧 `NUXT_PUBLIC_API_BASE_URL` も読めるようにしました。

## EC2初回デプロイ

ローカル開発とEC2本番の使い分けは [ENVIRONMENT_GUIDE.md](ENVIRONMENT_GUIDE.md) も参照してください。

### 1. 事前準備

EC2 に Docker Engine と Docker Compose plugin を入れてください。Security Group は最低限以下を開けます。

```text
22/tcp   SSH
80/tcp   Caddy HTTP challenge
443/tcp  HTTPS
```

DNS の A record を EC2 の public IP に向けます。

```text
auction.jongin.blog -> EC2 public IP
admin.jongin.blog   -> EC2 public IP
api.jongin.blog     -> EC2 public IP
```

### 2. 環境変数を作る

EC2 上でリポジトリのルートに移動し、`.env` を作成します。

```bash
cp .env.example .env
```

最低限、次は必ず変更してください。

```env
CADDY_EMAIL=your-email@example.com
RAILS_MASTER_KEY=...
SECRET_KEY_BASE=...
DATABASE_PASSWORD=strong-password
```

`RAILS_MASTER_KEY` は `backend/config/credentials.yml.enc` を復号するための値です。`SECRET_KEY_BASE` は以下のように生成できます。

```bash
docker run --rm ruby:3.2.4 ruby -rsecurerandom -e 'puts SecureRandom.hex(64)'
```

### 3. Build / DB準備 / 起動

```bash
./scripts/deploy-ec2.sh
```

スクリプト内部では以下を実行します。

```bash
docker compose --env-file .env -f docker-compose.yml build
docker compose --env-file .env -f docker-compose.yml run --rm backend bundle exec rails db:prepare
docker compose --env-file .env -f docker-compose.yml up -d
docker compose --env-file .env -f docker-compose.yml ps
```

### 4. 動作確認

```bash
curl https://api.jongin.blog/health
docker compose --env-file .env -f docker-compose.yml ps
docker compose --env-file .env -f docker-compose.yml logs -f backend
```

`{"status":"ok"}` が返れば backend は起動しています。

## 更新デプロイ

EC2 上で最新コードを反映して再デプロイします。

```bash
git pull
./scripts/deploy-ec2.sh
```

DB migration がある場合も `db:prepare` が実行されます。

## よく使う運用コマンド

```bash
# 状態確認
docker compose --env-file .env -f docker-compose.yml ps

# ログ確認
docker compose --env-file .env -f docker-compose.yml logs -f backend
docker compose --env-file .env -f docker-compose.yml logs -f frontend
docker compose --env-file .env -f docker-compose.yml logs -f admin
docker compose --env-file .env -f docker-compose.yml logs -f caddy

# Rails console
docker compose --env-file .env -f docker-compose.yml exec backend bundle exec rails console

# migration だけ実行
docker compose --env-file .env -f docker-compose.yml run --rm backend bundle exec rails db:migrate

# 再起動
docker compose --env-file .env -f docker-compose.yml restart backend

# 停止
docker compose --env-file .env -f docker-compose.yml down
```

## データ永続化

Compose volume を使っています。

```text
postgres_data  PostgreSQL data
rails_storage  Active Storage local files
caddy_data     Caddy certificates
caddy_config   Caddy config cache
```

`ACTIVE_STORAGE_SERVICE=local` の場合、アップロード画像は `rails_storage` volume に保存されます。EC2単体運用では簡単ですが、インスタンス作り直しや複数台構成には弱いです。本番運用を安定させるなら `ACTIVE_STORAGE_SERVICE=amazon` と S3 を使ってください。

## S3を使う場合

`.env` を変更します。

```env
ACTIVE_STORAGE_SERVICE=amazon
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

EC2 IAM Role を使う形に寄せるのがより安全です。その場合は Rails の S3 設定も IAM Role 前提へ寄せてください。

## 注意点

- Caddy が証明書を取得するため、初回起動前に DNS が EC2 を向いている必要があります。
- `FRONTEND_ORIGINS` には `https://auction...` と `https://admin...` の両方を入れてください。
- `admin` はまだ Rails API をブラウザから直接呼びます。将来的には Nuxt server route を使った BFF 化が望ましいです。
- `docker compose --env-file .env -f docker-compose.yml down -v` は DB・画像・証明書 volume を削除します。本番では実行しないでください。
- DB backup は別途必須です。まずは `pg_dump` を定期実行する運用を用意してください。

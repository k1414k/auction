```markdown
# core-api

jongin.blog 系サービス全体を支える共通 API サーバーです。  
認証、データ管理、画像管理をまとめて担います。

## 概要

このプロジェクトは、複数のフロントエンドアプリケーションを 1 つの Rails API で支えるためのバックエンドです。

- `auction` 向け API
- `admin` 向け API
- `web` 向け API
- 共通認証
- 共通 DB
- 画像アップロード基盤

## 設計方針

| 方針 | 内容 |
|---|---|
| 単一 API | 1 つの Rails API が全フロントを支える |
| 名前空間分離 | `/auction`, `/admin`, `/web` でサービスごとに API を分離 |
| 共通認証 | Devise Token Auth を `/auth` で共通利用 |
| Cookie 認証 | トークンを Cookie で保持し、CORS credentials で送受信 |
| RBAC | 管理者は `AdminPermission` でリソース単位の権限管理 |

## API 構成

### 認証
- `/auth`

### オークション向け API
- `/auction/v1`

### 管理画面向け API
- `/admin/v1`

### メインサイト向け API
- `/web/v1`

## 認証フロー

このプロジェクトでは `devise_token_auth` を利用しつつ、フロント側では Cookie ベースで認証状態を扱います。

1. フロントエンドが Rails API にログインリクエストを送る
2. Rails が認証情報をレスポンスヘッダで返す
   - `access-token`
   - `client`
   - `uid`
3. フロントエンド側で Cookie に保存する
4. 以後の通信では Cookie を自動送信して認証を維持する

## 権限管理

### User.role
- `user`
- `admin`
- `super_admin`

### AdminPermission
管理画面では、リソースごとに CRUD 権限を管理します。

- `can_read`
- `can_create`
- `can_update`
- `can_destroy`

## 技術スタック

- Ruby 3.2.4
- Rails 7.1
- PostgreSQL
- Devise
- devise_token_auth
- rack-cors
- Active Storage
- AWS S3（production）

## セットアップ

```bash
bundle install
cp .env.example .env
bin/rails db:create
bin/rails db:migrate
bin/rails s -p 3000
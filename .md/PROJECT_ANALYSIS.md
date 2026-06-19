# プロジェクト構造分析と改善提案

作成日: 2026-06-12  
対象: `backend` / `frontend` / `admin` を統合した現リポジトリ

## 結論

このリポジトリは、元々独立していた Rails API、Next.js フロント、Nuxt 管理画面を同じ Git リポジトリへ置いた状態です。コード自体は3アプリ構成として自然ですが、ルートに統合後の運用設計がまだ無いため、README、Docker、CI、環境変数、認証方式、API クライアントが各リポジトリ時代の前提を引きずっています。

最優先は次の3点です。

1. セキュリティ上の即時修正
   - `backend/app/controllers/auction/v1/items_controller.rb` の `update` / `destroy` に認証・所有者チェックがありません。
   - `backend/app/controllers/auction/v1/users_controller.rb` の `update_wallet` はユーザー自身が `balance` / `points` を直接増減できるため、本番用途では資金を作れてしまいます。
   - `admin` は認証トークンを `localStorage` に保存しており、`frontend` の HttpOnly Cookie 方針とズレています。

2. ルート主導の monorepo 化
   - ルート `README.md`、`docker-compose.yml`、`.env.example`、共通タスク、共通 CI を追加します。
   - 各ディレクトリ配下の `.github/workflows/deploy.yml` は、統合リポジトリでは GitHub Actions として機能しません。GitHub Actions は通常リポジトリルートの `.github/workflows` を参照します。
   - `frontend` に `package-lock.json` と `pnpm-lock.yaml` が同居しているため、パッケージマネージャを1つに統一します。

3. 認証・API 接続の統一
   - `frontend` は Next API Routes を Rails API の BFF/proxy として使い、HttpOnly Cookie にトークンを保存しています。
   - `admin` は Rails API をブラウザから直接叩き、トークンを `localStorage` に保存しています。
   - 管理画面も BFF/proxy 方式へ寄せるか、少なくとも Cookie / CSRF / CORS / Origin チェックの方針を1つに統一するべきです。

## 現在の構造

```text
.
├── backend/   # Rails 7.1 API, PostgreSQL, devise_token_auth, Active Storage
├── frontend/  # Next.js 15 Pages Router, React 19, Tailwind, Zustand
└── admin/     # Nuxt 4, Vue 3, Pinia, Vuetify
```

確認できた規模感:

- 管理対象ファイル数: 約279ファイル
- 主要コード・設定行数: 約15,629行
- GitHub Actions: `backend/.github`、`frontend/.github`、`admin/.github` に同一内容の deploy workflow が重複
- Docker Compose: なし
- ルート README: なし
- ルート `.env.example`: なし
- ルートタスクランナー: なし

## 各アプリの役割

### `backend`

Rails API です。`/auction/v1`、`/admin/v1`、`/web/v1` で名前空間を分けています。認証は `devise_token_auth` を `/auth` に mount しています。

良い点:

- API 名前空間が用途ごとに分かれている
- 管理画面向けに `Admin::V1::BaseController` があり、RBAC の入口がある
- Active Storage の型・サイズチェックが一部モデルに入っている
- `FRONTEND_ORIGINS` による複数 Origin 許可の考慮がある

問題点:

- `Auction::V1::ItemsController#update/#destroy` が未認証で実行可能
- `update_wallet` がユーザー自身による残高・ポイント直接操作を許している
- `Order#create` と `BidsController#create` に競合対策が薄く、二重購入・同時入札の整合性が崩れやすい
- `Order#create` が `rescue => e` で内部エラー文言をそのまま返す
- `Item#images_count_within_limit` が定義されているが `validate` に登録されておらず、画像枚数制限が効いていない
- `favorites` に `user_id,item_id` のユニーク index が無く、toggle の競合で重複し得る
- `orders.item_id` にユニーク index が無く、1商品1注文の DB 保証がない
- `database.yml` の production でも DB パスワードに `"password"` のデフォルトがある
- `production.rb` の `config.require_master_key` がコメントアウトされている
- `production.rb` の `force_ssl` がデフォルト false
- `entrypoint.sh` がコンテナ起動時に `db:create` / `db:migrate` を実行するため、本番・複数台構成では危険
- `core-api.Dockerfile` / `core-api.al2.Dockerfile` がビルド中に GitHub から別リポジトリを clone しており、統合リポジトリの再現可能ビルドになっていない

### `frontend`

Next.js のユーザー向けフロントです。`src/pages/api/*` が Rails API への proxy になっており、Rails の `access-token/client/uid` を HttpOnly Cookie に保存しています。

良い点:

- ブラウザに認証トークンを直接置かない設計になっている
- Rails API の URL を `INTERNAL_API_BASE_URL` と `NEXT_PUBLIC_API_BASE_URL` で分ける意図がある
- Dockerfile が multi-stage + standalone output になっている

問題点:

- `package-lock.json` と `pnpm-lock.yaml` が同居しており、Dockerfile は pnpm を優先する
- `pnpm-lock.yaml` 内に Next.js の CVE 注意が記録されているため、依存更新の確認が必要
- API Route の proxy 実装が各ファイルに散らばり、エラー処理・メソッド制御・レスポンス形式が統一されていない
- Cookie が production で `SameSite=None` になっているため、構成次第では CSRF 対策を別途明確にする必要がある
- `next.config.ts` の production 画像 remotePatterns に HTTP origin と localhost fallback が残っている
- frontend 配下に `.idea` が残っており、ルート `.gitignore` でエディタ生成物を統一した方がよい

### `admin`

Nuxt の管理画面です。Rails API をブラウザから直接呼び、レスポンスヘッダの token を Pinia store 経由で `localStorage` に保存しています。

良い点:

- `auth.global.ts` で admin / super_admin のルートガードがある
- 管理 API 側にも `Admin::V1::BaseController` の認証・権限チェックがある

問題点:

- `localStorage` に管理者トークンを保存しており、XSS 時の影響が大きい
- `admin/src/lib/debugLog.ts` にローカル debug ingest URL と session id がハードコードされ、複数ページから呼ばれている
- `nuxt.config.ts` は `NUXT_PUBLIC_API_BASE` を読み、`admin/src/lib/api.ts` は `NUXT_PUBLIC_API_BASE_URL` を参照しており、環境変数名が揺れている
- `$fetch` 呼び出しがページ内に散らばり、認証ヘッダ付与・401処理・エラー整形が統一されていない
- 管理画面用 README は独立リポジトリ前提で、統合後の起動手順や backend 依存関係を説明していない

## 最優先で直すべきセキュリティ項目

### 1. 商品更新・削除 API の認可

対象: `backend/app/controllers/auction/v1/items_controller.rb`

現状:

- `before_action :authenticate_user!` が `create` のみに限定されています。
- `update` / `destroy` は未ログインでも到達できます。
- 所有者確認もありません。

推奨:

- `create, update, destroy` を認証必須にする
- `update, destroy` は `@item.user_id == current_user.id` を必須にする
- 管理者操作は `/admin/v1/items` 側に限定する
- request spec を追加する

### 2. Wallet API の権限設計

対象: `backend/app/controllers/auction/v1/users_controller.rb`

現状:

- 認証済みユーザーが `type=balance` / `type=points` と任意の `amount` を送ると、制限内で自分の残高・ポイントを増やせます。

推奨:

- 一般ユーザーからの直接増額 API を廃止する
- チャージ、購入、売上反映、返金などのドメインイベント経由だけで残高を変更する
- 管理者補正が必要なら `/admin/v1` に監査ログ付きで分離する
- `wallet_transactions` テーブルを作り、残高は台帳から再計算可能にする

### 3. 管理画面の token 保管

対象: `admin/src/stores/auth.ts`

現状:

- 管理者 token を `localStorage` に保存しています。

推奨:

- `frontend` と同じ HttpOnly Cookie + server-side proxy 方式へ寄せる
- Nuxt server routes を BFF として使い、Rails token はブラウザ JS から読めない Cookie に保存する
- 直接 Rails API を叩く方針を維持する場合も、短寿命 token、厳格な CSP、XSS 対策、token rotation、Origin 検証を追加する

### 4. CSRF / Origin 方針

現状:

- Cookie 認証を使っていますが、CSRF 方針が README・コード上で明確ではありません。
- production Cookie が `SameSite=None` のため、別サイトからのリクエストに Cookie が乗る構成になり得ます。

推奨:

- 同一 site 配下で運用できるなら `SameSite=Lax` または `Strict` を優先する
- mutating な Next/Nuxt API route で `Origin` / `Referer` を検証する
- Rails に直接 Cookie 認証を通す場合は CSRF token を導入する
- CORS は `FRONTEND_ORIGINS` の完全一致のみ許可し、ワイルドカードは禁止する

### 5. 本番設定の堅牢化

対象:

- `backend/config/environments/production.rb`
- `backend/config/database.yml`
- `backend/config/storage.yml`
- `backend/entrypoint.sh`

推奨:

- `config.require_master_key = true`
- `FORCE_SSL` の production default を true にする
- production DB password に default を置かず `ENV.fetch` で必須化する
- S3 は EC2/ECS IAM Role を優先し、静的 access key を環境変数に置かない
- migration はコンテナ起動ではなく deploy の release step で1回だけ実行する

## 統合で削減できる重複

### README

現状:

- `backend/README.md`、`frontend/README.md`、`admin/README.md` が各リポジトリ前提
- Markdown code fence が閉じていない箇所がある
- 統合後の全体像、起動順、環境変数、ポート、依存関係がルートに無い

推奨構成:

```text
README.md
docs/
  architecture.md
  development.md
  deployment.md
  security.md
backend/README.md   # backend 固有情報だけに縮小
frontend/README.md  # frontend 固有情報だけに縮小
admin/README.md     # admin 固有情報だけに縮小
```

ルート README に書くべき内容:

- サービス概要
- アプリ構成
- ローカル起動手順
- 必須環境変数
- Docker Compose
- よく使うコマンド
- デプロイ概要
- セキュリティ注意点

### Docker

現状:

- `backend/Dockerfile`
- `backend/core-api.Dockerfile`
- `backend/core-api.al2.Dockerfile`
- `frontend/Dockerfile`
- `admin/Dockerfile`
- ルート `docker-compose.yml` なし

推奨:

- `backend/core-api*.Dockerfile` は削除候補
- ルートに `docker-compose.yml` を追加
- `db`、`backend`、`frontend`、`admin` を1コマンドで起動できるようにする
- `backend` の migration は `backend-migrate` のような one-shot service に分離する
- `frontend` / `admin` に `.dockerignore` を追加する
- production image と development compose の責務を分ける

推奨ポート:

```text
backend:  3000
frontend: 3001
admin:    3003
db:       5432
```

### GitHub Actions

現状:

- 3つの subdir に同じ deploy workflow が存在
- 統合リポジトリではルート `.github/workflows` に移さないと動かない
- test / lint / build の CI が無い

推奨:

```text
.github/workflows/
  ci.yml
  deploy.yml
```

`ci.yml` の内容:

- backend: `bundle exec rails test`
- frontend: `npm ci`, `npm run lint`, `npm run build`
- admin: `npm ci`, `npm run build`
- path filter で変更のあったアプリだけ実行

`deploy.yml` の内容:

- ルートで1つだけ管理
- backend/frontend/admin の build/deploy 順序を明示
- migration step を1回だけ実行
- self-hosted runner の固定スクリプト `/home/ec2-user/projects/deploy.sh` 依存を減らす

### パッケージ管理

現状:

- `frontend`: `package-lock.json` と `pnpm-lock.yaml` が同居
- `admin`: `package-lock.json`
- ルート package/workspace 設定なし

推奨:

- 最適化優先なら pnpm workspace に統一
- 保守の単純さ優先なら npm workspace に統一
- どちらでも lockfile はルートに1つだけ置く
- Node version を `.node-version` または `.tool-versions` で固定する
- Ruby version も `.ruby-version` または `.tool-versions` で固定する

pnpm workspace 案:

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
frontend/package.json
admin/package.json
```

ルート scripts 案:

```json
{
  "scripts": {
    "dev:frontend": "pnpm --dir frontend dev",
    "dev:admin": "pnpm --dir admin dev",
    "build:frontend": "pnpm --dir frontend build",
    "build:admin": "pnpm --dir admin build",
    "lint:frontend": "pnpm --dir frontend lint"
  }
}
```

### 環境変数

現状の揺れ:

- backend CORS: `FRONTEND_ORIGINS` / `FRONTEND_URL`
- frontend proxy: `INTERNAL_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`
- admin runtime: `NUXT_PUBLIC_API_BASE`
- admin axios: `NUXT_PUBLIC_API_BASE_URL`

推奨:

- ルート `.env.example` を作り、全アプリの変数を一箇所で説明する
- public 変数と server-only 変数を明確に分ける
- `*_URL` / `*_BASE_URL` の命名を統一する
- admin の `NUXT_PUBLIC_API_BASE` と `NUXT_PUBLIC_API_BASE_URL` をどちらかに寄せる

例:

```env
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

RAILS_ENV=development
FRONTEND_ORIGINS=http://localhost:3001,http://localhost:3003
RAILS_INTERNAL_HOSTS=backend

INTERNAL_API_BASE_URL=http://backend:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NUXT_PUBLIC_APP_URL=http://localhost:3003
```

## API / 認証設計の統一案

### 推奨案: BFF/proxy 統一

`frontend` は既にこの形です。`admin` も Nuxt server routes を使って同じ形に寄せます。

```text
Browser
  -> frontend/admin server route
    -> Rails API
```

利点:

- Rails token をブラウザ JS から隠せる
- CORS を Rails と BFF 間に限定しやすい
- CSRF / Origin / Cookie policy を各 frontend server で統制しやすい
- API エラー整形と auth refresh を共通化できる

短期対応:

- admin の `localStorage` token を廃止
- `admin/server/api/*` に auth proxy を作る
- `frontend/src/lib/axios.ts` 相当の処理を admin 側にも実装する
- 将来的には `packages/api-client` で型・エラー処理を共有する

## DB / ドメイン整合性

優先追加したい DB 制約:

- `favorites`: unique index `[:user_id, :item_id]`
- `orders`: 商品が1回しか売れないなら unique index `[:item_id]`
- `bids`: 金額順検索のため `[:item_id, :amount]` index
- `offers`: 必要なら `[:item_id, :user_id, :status]` index

優先追加したいトランザクション:

- 購入処理は `item.with_lock` で在庫状態を確認してから order 作成
- 入札処理は `item.with_lock` で current max と minimum bid を計算
- offer accept は同一商品の他 offer 状態や order 作成と一貫させる
- wallet は台帳テーブルを使い、直接残高更新を避ける

## パフォーマンス改善

### backend

- `ItemsController#index` / `ending_soon` / `one_yen` が item ごとに `bids.maximum` と `bids.count` を呼ぶため、一覧で N+1 集計が発生します。
- `current_user.favorited?(item)` もログイン時に item ごとの existence query になり得ます。
- 一覧 API に pagination がありません。
- admin item/user/category 一覧にも pagination がありません。

推奨:

- `current_bid_amount` / `bids_count` の counter cache または集計 query を導入
- favorite はログインユーザーの favorite item ids をまとめて取得
- `limit`, `cursor`, `page` を導入
- serializer を共通化し、auction/admin で同じ JSON 組み立てを重複させない

### frontend/admin

- API Route / `$fetch` 呼び出しが散らばっているため、キャッシュ・エラー処理・認証処理を共通化しづらい
- frontend と admin で型定義が別々

推奨:

- Rails から OpenAPI schema を出す
- `openapi-typescript` などで TS 型を生成
- `packages/api-client` または各アプリの `lib/apiClient` を schema ベースにする
- フォーム validation は backend と frontend の仕様差分が出ないようにスキーマ化する

## テスト戦略

現状:

- Rails test はほぼ雛形のみ
- frontend/admin に test file が見当たらない
- CI で lint/build/test を回す仕組みが無い

最初に追加するテスト:

- 未ログインで item update/destroy できない
- 他人の商品を update/destroy できない
- 一般ユーザーが wallet を任意増額できない
- admin 権限なしで `/admin/v1/*` にアクセスできない
- 商品購入の二重作成を防ぐ
- favorite duplicate を防ぐ
- 画像の型・サイズ・枚数制限

CI の最初の到達点:

- backend: `rails test`
- frontend: `lint` + `build`
- admin: `build`

## 推奨ロードマップ

### Phase 0: 即時修正

- `auction/v1/items#update/#destroy` に認証・所有者チェックを追加
- `update_wallet` の直接増額を停止
- `admin/src/lib/debugLog.ts` と呼び出しを削除、または development 限定にする
- admin token の `localStorage` 保管をやめる設計に着手
- production の `require_master_key` / `force_ssl` / DB env 必須化を見直す

### Phase 1: ルート統合

- ルート `README.md`
- ルート `.env.example`
- ルート `docker-compose.yml`
- ルート `.github/workflows/ci.yml`
- ルート `.gitignore`
- frontend/admin のパッケージ管理統一

### Phase 2: Docker / Deploy 整理

- `backend/core-api*.Dockerfile` を削除
- backend image を non-root 実行へ変更
- migration を release job に分離
- deploy workflow をルートへ統合
- self-hosted runner 依存をドキュメント化

### Phase 3: API と型の共通化

- OpenAPI schema 導入
- TS 型生成
- frontend/admin の API client 統一
- admin を BFF/proxy 方式へ移行

### Phase 4: DB 整合性とパフォーマンス

- DB unique/index 追加
- 購入・入札・オファー accept の lock/transaction 強化
- 一覧 API pagination
- aggregate N+1 解消

## 推奨される最終構造

大規模な rename は後回しでよいですが、最終的には次のように寄せると見通しがよくなります。

```text
.
├── README.md
├── PROJECT_ANALYSIS.md
├── docker-compose.yml
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── architecture.md
│   ├── development.md
│   ├── deployment.md
│   └── security.md
├── backend/
├── frontend/
└── admin/
```

さらに整理する場合:

```text
.
├── apps/
│   ├── auction-web/  # 現 frontend
│   └── admin-web/    # 現 admin
├── services/
│   └── api/          # 現 backend
└── packages/
    └── api-client/
```

ただし、最初から `apps/` / `services/` へ移動すると import、Docker、deploy、環境変数、CI の変更範囲が広がります。まずは現ディレクトリ名を維持して、ルートに統合基盤を足す方が安全です。

## 具体的な次アクション

1. API の危険箇所を修正する
   - item update/destroy
   - wallet
   - admin debugLog

2. ルート統合ファイルを追加する
   - `README.md`
   - `.env.example`
   - `docker-compose.yml`
   - `.github/workflows/ci.yml`

3. パッケージマネージャを統一する
   - pnpm に寄せるなら root `pnpm-workspace.yaml`
   - npm に寄せるなら `frontend/pnpm-lock.yaml` を削除

4. 認証方式を統一する
   - admin を HttpOnly Cookie + Nuxt server route proxy に寄せる
   - Cookie `SameSite` と CSRF 方針を明文化する

5. DB 制約と request spec を追加する
   - favorites unique
   - orders item unique
   - auth/authorization request spec
   - purchase/bid race condition spec

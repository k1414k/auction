#　URL
https://admin.jongin.blog

```markdown
# Admin

jongin.blog 系サービスの管理画面です。

## 概要

このプロジェクトは、サービス運営者向けの管理画面として作成しています。

- ユーザー管理
- 商品管理
- カテゴリ管理
- 注文管理
- 権限管理
- ダッシュボード表示

## 設計

### 役割
- ユーザー・商品・カテゴリ・注文の管理
- ユーザー権限（AdminPermission）の設定
- ダッシュボード・統計表示

### 技術構成
- **Nuxt 4**
- **Vue 3**
- **Vuetify**
- **Pinia**（状態管理）

### 認証
- Rails API の `/auth/sign_in` でログイン
- `withCredentials: true` で Cookie 送信
- グローバルミドルウェアで未認証時はログイン画面へリダイレクト

### 権限
- `admin` / `super_admin` のみアクセス可
- リソースごとに `can_read`, `can_create`, `can_update`, `can_destroy` をチェック

## 技術スタック

- Nuxt 4
- Vue 3
- Vuetify
- Pinia
- Axios

## セットアップ

```bash
npm install
npm run dev

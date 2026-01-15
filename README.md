仕様バージョン
NODE VERSION ^24.12.0

git ignoreファイル名
.env.local


ー
プロジェクト設計のポイント

グローバルな状態管理に Zustand を採用
ログインユーザー情報（ニックネーム・残高・ポイントなど）を Zustand に保持。
_app.tsx 内で UserInitializer コンポーネントを配置し、全ページで自動的に API からユーザー情報を取得・初期化。
SPA 的に状態が即反映され、ページ遷移やモーダル表示でも常に最新情報を参照可能。

API 呼び出しと状態同期を統一
nextApi 関数をラップして共通化。fetch / axios の冗長な設定を省略し、型安全な API 呼び出しを実現。
成功時は Zustand に保存、失敗時はエラー処理を統一。

セキュアで拡張性のある Rails バックエンド設計

DeviseTokenAuth を活用し、トークン認証を安全に実装

ユーザー残高・ポイント更新は with_lock でトランザクション制御

API は type と amount による汎用的な更新設計で、将来的なフィールド追加にも柔軟

フロント・バックエンドで型安全性と再利用性を重視

TypeScript で API レスポンス型やフォーム型を定義

formatNumber など共通ユーティリティを utils に配置し、複数ページで再利用

その他の良い設計例

モーダルやフォームの状態管理をコンポーネント単位で完結

ニックネーム・パスワード変更やウォレット更新など、API 呼び出しと状態更新を明確に分離

Rails 側のモデルにバリデーションやトランザクション制御を集中させ、コントローラーは API の操作に専念


devise_token_auth を用いた API 認証基盤に ActiveStorage を組み合わせ、
プロフィール画像は DB に直接保存せず署名付き URL として管理。
フロントは Zustand でユーザー状態を一元管理し、
プロフィール更新を SPA 的に即時反映する設計

----------------
設計まとめ
本アプリケーションでは、Next.js（Pages Router）と Rails API（Devise + DeviseTokenAuth）を用いた構成において、
セキュリティ・UX・実務での運用性を重視した認証設計を行いました

- ログイン関連
  ユーザー認証についての設計にあたり次の要素を考慮しました
  １．ローカルストレージは保安上の理由で実務での使用率が低いためcookieの中にトークンを入れる方式を採用しました
  ２．ログイン成功時に３つの情報をcookieに保存し,フロントでは Cookie(acess-token,client,uid) の有無のみを軽量なガードとして
  使用し、 正当性の検証は Rails 側で必ず行いました. 存在しないユーザーは素早くそのページから弾く形にしました.
  方法としてはnext middlewareを使い権限が必要なページを分け、cookieを持ってないユーザ-を弾くようにします.
  ３．弾かれたユーザーはもちろんユーザー情報が必要なページなどにアクセスできなく正しくログインしてトークンを得る必要があります
  ４．またrailsのコントローラーにbefore_action: authenticate_user!を用いることにより、
  もし仮に悪意を持ったりしてブラウザのcookieが改ざんされた場合を備えてフロントだけじゃなくrailsサーバーでも検証チェックを
  するようにしました.
5. さらに保安強化策としてnext.jsのAPI Routesを経由することにしました。
   フロントエンドではnext apiをfetchで呼び出しnext apiの中ではaxiosをつかってrailsと
   通信することによりバックエンドのapiエンドポイントをユーザーからはわからなくするようにしました.
   6．１－5 によってユーザーはより速いuxを感じることも可能になり、フロントおよびサーバーで正しくないトークンを持ったユーザーが
   ユーザー情報が入ったapiを呼び出すことができなくなり保安上のトラブルも減する設計になります


!!!nextapiで401などのエラ番号の他にもjsonを返すところは
フロントでfetchのあとthen にresとして出力しないと意味がない！！！

### ニックネーム自動生成の設計意図

ユーザー作成時に nickname が未指定の場合、
`before_create` コールバックで一意な値を生成しています。

DeviseTokenAuth ではユーザー作成時に
内部的に複数回 validation / save が行われるため、
`before_validation` を使用すると
同一レコードに対して nickname が再生成され、
unique index と衝突する可能性があります。

そのため、本アプリでは
**DB INSERT 直前に1度だけ実行される `before_create` を採用**
しています。


なにを作ったか（1〜2行）

技術スタック

設計方針（← 今あなたが書いてるところ）

工夫した点

実務で意識した点

今後の改善点


# Auction App API

## 概要
モバイル利用を前提としたオークションサービスのAPIです。
フロントエンドは Next.js、バックエンドは Rails API として分離構成を採用しています。

## 技術スタック
- Backend: Ruby on Rails 7 (API mode)
- Frontend: Next.js
- DB: PostgreSQL
- Auth: Devise Token Auth
- Infra: AWS (EC2 / RDS)
- CI/CD: GitHub Actions

## 設計方針
- RESTful API を基本とした設計
- resource / resources を用途に応じて使い分け
- current_user 前提のAPIは単数 resource を使用
- モバイルファーストUI（PCでは破綻しない最低限対応）

## 主な機能
- ユーザー認証（トークンベース）
- 商品出品・閲覧
- カテゴリ管理
- オークション入札

## ディレクトリ構成
- app/controllers/v1
- app/models
- app/services（必要に応じて）

## 今後の改善点
- 認可の厳密化（Pundit）
- N+1対策
- バックグラウンドジョブ導入

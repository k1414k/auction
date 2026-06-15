# Auction App プロジェクト監査・改善指示書

## 0. このドキュメントの目的

この Markdown ファイルは、現在の Auction App プロジェクトに対して、AI エージェントまたは開発者が以下を実行するための指示書である。

1. 現在の実装を念入りに確認する。
2. 既に解決・改善されている項目は「対応済み」と判断する。
3. 未対応・不完全・本番環境で不具合が残る項目は修正する。
4. 修正後に動作確認・テスト・再発防止の観点で確認する。

重要：  
このドキュメントは「最初から全部作り直すための仕様書」ではない。  
まず現状コードを調査し、既存実装を尊重したうえで、不足分だけを安全に改善すること。

---

## 1. 前提環境

### Runtime

```txt
Node.js: ^24.12.0
```

### 環境変数ファイル

```txt
.env.local
```

### Git 管理上の注意

`.env.local` は秘密情報を含む可能性があるため、必ず `.gitignore` に含めること。

確認項目：

```txt
.env.local
```

が `.gitignore` に存在するか確認する。

未対応の場合は追加する。

---

## 2. アプリケーション概要

### 何を作ったか

モバイル利用を前提としたオークションサービス。  
Next.js フロントエンドと Rails API バックエンドを分離した構成で、ユーザー認証、商品出品、閲覧、入札、取引管理を行う。

### 技術スタック

| 項目 | 使用技術 |
|---|---|
| Frontend | Next.js / Pages Router / TypeScript |
| Backend | Ruby on Rails 7 / API Mode |
| Database | PostgreSQL |
| Authentication | Devise / DeviseTokenAuth |
| State Management | Zustand |
| Storage | ActiveStorage |
| Infrastructure | AWS EC2 / AWS RDS |
| CI/CD | GitHub Actions |

---

## 3. 全体設計方針

### 3.1 フロントエンド設計

- Next.js Pages Router を前提とする。
- グローバル状態管理には Zustand を採用する。
- ログインユーザー情報は Zustand に保持する。
- API 呼び出しは `nextApi` のような共通ラッパーに集約する。
- モーダルやフォームの状態は可能な限りコンポーネント単位で完結させる。
- 共通処理は `utils` に分離する。
- TypeScript により API レスポンス型・フォーム型を定義する。

### 3.2 バックエンド設計

- Rails API Mode を前提とする。
- 認証は Devise / DeviseTokenAuth を使用する。
- 認証必須 API では `before_action :authenticate_user!` を使用する。
- ユーザー残高・ポイントなど金銭的な値の更新では `with_lock` を使い、排他制御を行う。
- バリデーション、トランザクション、業務ロジックは Model または Service に寄せる。
- Controller は API 入出力と操作の呼び出しに専念させる。

### 3.3 API 設計

- RESTful API を基本とする。
- `resource` / `resources` を用途に応じて使い分ける。
- `current_user` 前提の API は単数 `resource` を使用する。
- 通常の一覧・詳細・作成・更新・削除は複数形 `resources` を使用する。
- 将来的な拡張性を考慮し、残高・ポイント更新 API は以下のような汎用形式を検討・採用する。

```json
{
  "type": "balance",
  "amount": 1000
}
```

---

## 4. 重要な実装方針

## 4.1 Zustand によるユーザー状態管理

### 目的

ログインユーザー情報をフロント全体で一元管理し、ページ遷移・モーダル表示・プロフィール更新時に即時反映する。

### Zustand に保持する主な情報

- user id
- nickname
- email
- balance
- points
- profile image url
- その他ユーザー情報

### 期待する構成

- `userStore` または同等の Zustand store が存在する。
- `setUser`
- `clearUser`
- `updateUser`
- `fetchCurrentUser`
- `isAuthenticated`
- `isLoading`

のような状態・操作が整理されていることが望ましい。

### 確認項目

- ログイン成功後、Zustand の user 情報が即時更新されるか。
- ログアウト成功後、Zustand の user 情報が即時クリアされるか。
- 会員登録成功後、Zustand の user 情報が即時更新されるか。
- プロフィール更新後、リロードなしで UI に反映されるか。
- 残高・ポイント更新後、リロードなしで UI に反映されるか。
- ページ遷移後も状態が不自然に消えないか。

### 未対応時の修正方針

- 認証成功時の API レスポンスから user 情報を取得し、明示的に Zustand に保存する。
- ログアウト時は Cookie 削除と Zustand 初期化を必ずセットで行う。
- プロフィール更新 API の成功後、返却された最新 user 情報で Zustand を更新する。
- API 成功後にリロードへ依存する実装があれば削除する。

---

## 4.2 UserInitializer

### 目的

`_app.tsx` 内に `UserInitializer` コンポーネントを配置し、全ページ共通でユーザー情報を初期化する。

### 期待する挙動

- アプリ起動時に Cookie の存在を確認する。
- Cookie が存在する場合のみ `/current_user` などの API を呼び出す。
- API が成功した場合、Zustand に user 情報を保存する。
- API が失敗した場合、Cookie と Zustand を必要に応じてクリアする。
- これにより SPA 的に最新状態を扱えるようにする。

### 確認項目

- `_app.tsx` で `UserInitializer` が全ページに適用されているか。
- 初回表示時に current user を取得しているか。
- 未ログイン時に不要な API 呼び出しが連発していないか。
- 認証切れ時に古い user 情報が残らないか。
- 本番環境で Cookie 反映前に middleware が走り、ログイン画面へ戻される問題がないか。

---

## 4.3 API 呼び出しの共通化

### 目的

`fetch` / `axios` の設定やエラー処理を各ページに散らばらせず、共通化する。

### 期待する構成

- `nextApi` のような共通 API 関数を用意する。
- フロントからは Rails API を直接叩かず、Next API Routes を経由する。
- API レスポンス型を TypeScript で定義する。
- 401 / 403 / 422 / 500 などを共通的に処理できるようにする。

### 重要な注意点

Next API Routes 側で 401 / 403 / 422 などの HTTP ステータスや JSON を返しても、フロント側で正しく読み取らなければ意味がない。

必ず以下のように `res` を確認し、JSON を取得すること。

```ts
const res = await fetch("/api/example", options);
const data = await res.json();

if (!res.ok) {
  throw new Error(data?.message || "API request failed");
}
```

または、共通ラッパー内でこの処理を統一すること。

### 確認項目

- API エラー時に `res.ok` を確認しているか。
- エラー JSON をフロントで読み取っているか。
- `then(res => ...)` または `await res.json()` の処理が抜けていないか。
- API 成功後に Zustand 更新まで行われているか。
- 同じような fetch 処理が複数ファイルに重複していないか。

---

## 4.4 認証設計

### 目的

Next.js Pages Router と Rails API + DeviseTokenAuth の構成で、セキュリティ、UX、実務運用性を重視した認証を行う。

### 基本方針

#### 1. Cookie Based Authentication

LocalStorage ではなく Cookie に認証情報を保存する。

保存する主な情報：

```txt
access-token
client
uid
```

注意：  
`access-token` のスペルミスに注意すること。  
`acess-token` のような typo があると認証不具合の原因になる。

#### 2. Frontend Guard

フロント側では Cookie の有無のみを軽量なガードとして使用する。

使用箇所：

- `middleware.ts`
- 認証必須ページ
- profile
- user 情報ページ
- transaction ページ
- 出品・購入・管理系ページ

Cookie がない場合は login にリダイレクトする。

#### 3. Backend Verification

Rails 側では必ず `before_action :authenticate_user!` により正当性を検証する。

目的：

- Cookie 改ざん対策
- フロント側チェックだけに依存しない
- 不正トークンで user API が呼ばれることを防ぐ

#### 4. Next API Routes 経由

通信経路は以下を基本とする。

```txt
Frontend
  ↓
Next API Routes
  ↓
Rails API
```

Next API Routes 内では axios などを使用し、Rails API と通信する。

目的：

- Rails API endpoint をフロントから直接見えにくくする
- Cookie 処理を Next 側でまとめる
- エラー処理を統一する
- UX とセキュリティのバランスを取る

### 確認項目

- Cookie に `access-token`, `client`, `uid` が保存されているか。
- Cookie 属性が本番環境に合っているか。
  - `Secure`
  - `SameSite`
  - `Path`
  - `Domain`
  - `HttpOnly` の有無
- 本番環境で会員登録直後に Cookie が反映される前に middleware で弾かれていないか。
- login / logout / signup 後に Zustand と Cookie の状態が一致しているか。
- Rails 側で `authenticate_user!` が必要な API に設定されているか。
- Next API Routes が Rails のレスポンスヘッダー、特に認証トークン更新ヘッダーを正しく扱っているか。

---

## 4.5 プロフィール画像設計

### 方針

プロフィール画像は DB に直接保存しない。

使用：

- ActiveStorage

管理方法：

- DB には画像本体を保存しない。
- Rails 側で ActiveStorage に添付する。
- フロントには signed URL または安全にアクセスできる URL を返す。

### 確認項目

- profile image が ActiveStorage で管理されているか。
- Base64 や画像バイナリを user テーブルに直接保存していないか。
- プロフィール更新後、返却された image URL が Zustand に即時反映されるか。
- 期限付き URL の期限切れ時の挙動に問題がないか。

---

## 4.6 ニックネーム自動生成

### 設計意図

ユーザー作成時に nickname が未指定の場合、一意な nickname を自動生成する。

### 注意点

DeviseTokenAuth ではユーザー作成時に内部的に複数回 validation / save が行われる可能性がある。

そのため、`before_validation` で nickname を生成すると、同一レコードに対して nickname が再生成され、unique index と衝突する可能性がある。

### 採用方針

`before_create` を採用する。

理由：

- DB INSERT 直前に 1 回だけ実行される。
- 同一レコードで nickname が複数回変わる問題を避けやすい。

### 確認項目

- nickname 自動生成が `before_create` で行われているか。
- nickname に unique index があるか。
- 未指定時のみ生成されるか。
- 指定済み nickname を上書きしていないか。
- 生成値が衝突した場合の再試行または安全策があるか。

---

## 5. 既存機能

### 主な機能

- ユーザー認証
- 会員登録
- ログイン
- ログアウト
- プロフィール表示
- プロフィール更新
- プロフィール画像更新
- 商品出品
- 商品閲覧
- 商品検索
- カテゴリ管理
- オークション入札
- ウォレット / 残高 / ポイント管理
- 取引ページ
- 取引メッセージ

### 想定ディレクトリ

Rails：

```txt
app/controllers/v1
app/models
app/services
```

Next.js：

```txt
pages
pages/api
components
stores
utils
types
middleware.ts
_app.tsx
```

---

# 6. 最優先で確認・修正する不具合

## 6.1 本番環境でログイン状態が即時反映されない

### 現象

本番環境で以下の操作後、Zustand を使っているにも関わらず、リロードしないと状態が反映されない。

- 会員登録
- ログイン
- ログアウト

### 現象の詳細

ローカル環境：

```txt
会員登録後 → user/profile に遷移
```

本番環境：

```txt
会員登録後 → profile に遷移しようとする
→ 認証が間に合わない
→ middleware により login に戻される
```

現状：

```txt
その後リロードすると認証され、ルートページに飛ぶ
```

### 推測される原因候補

- Set-Cookie がブラウザに反映される前に router.push している。
- Next API Routes が Rails の認証ヘッダーを Cookie に正しく保存していない。
- 本番環境の Cookie 属性が不適切。
- `SameSite`, `Secure`, `Domain`, `Path` の設定が本番 URL と合っていない。
- middleware が Cookie の存在だけを見て早く判定しすぎている。
- Zustand 更新と router 遷移の順序が逆になっている。
- UserInitializer の current user 取得が遷移後に間に合っていない。
- ログアウト時に Cookie は消えているが Zustand が残っている、またはその逆が起きている。

### 調査手順

1. signup / login / logout のフロント処理を確認する。
2. Next API Routes の auth 関連処理を確認する。
3. Rails DeviseTokenAuth のレスポンスヘッダーを確認する。
4. Next API Routes が受け取った token 情報を Cookie に正しく保存しているか確認する。
5. Cookie 属性をローカル・本番で比較する。
6. middleware の認証判定ロジックを確認する。
7. Zustand の `setUser` / `clearUser` が適切なタイミングで呼ばれているか確認する。
8. signup / login 成功後の `router.push` の前に user 初期化が完了しているか確認する。
9. 本番環境で DevTools の Network / Application / Cookies を確認する。

### 修正方針

- signup / login 成功後は、Cookie 保存完了後に current user を取得する。
- current user 取得成功後に Zustand を更新する。
- Zustand 更新後に profile などへ遷移する。
- logout 成功後は Cookie 削除、Zustand clear、router 遷移を一貫して行う。
- middleware は Cookie の有無チェックに限定し、正当性検証は Rails 側に任せる。
- 本番環境では `Secure: true` を使用する。
- クロスドメイン構成の場合は `SameSite=None; Secure` の必要性を検討する。
- 同一サイト構成の場合は `SameSite=Lax` で成立するか確認する。
- Domain の指定が誤っている場合は修正する。

### 完了条件

- 本番環境で会員登録後、リロードなしでログイン状態になる。
- 本番環境でログイン後、リロードなしで user 情報が反映される。
- 本番環境でログアウト後、リロードなしで未ログイン状態になる。
- 本番環境で profile に正しく遷移できる。
- 不正 Cookie または期限切れトークンでは Rails API により拒否される。
- フロントには古い user 情報が残らない。

---

## 6.2 モバイル input フォーカス時に自動拡大される

### 現象

スマートフォンで input をクリックすると画面が勝手に拡大される。  
拡大により UI が崩れ、ユーザーが手動で縮小する必要がある。

### 原因候補

iOS Safari では `input`, `textarea`, `select` の font-size が 16px 未満の場合、自動ズームが発生しやすい。

### 確認項目

- input / textarea / select の font-size が 16px 以上か。
- Tailwind や CSS で `text-sm` などが指定されていないか。
- モバイル表示時だけ小さい font-size になっていないか。
- viewport meta tag が不適切ではないか。
- ページ遷移後にズーム状態が残るか。

### 修正方針

- モバイルの form 要素は `font-size: 16px` 以上にする。
- 共通 input コンポーネントがある場合はそこに集約して修正する。
- 個別ページに散らばった input スタイルを統一する。
- `maximum-scale=1` のようなアクセシビリティを損ねる対策は原則避ける。
- どうしても必要な場合のみ、UX とアクセシビリティの影響を確認して判断する。

### 完了条件

- スマホで input をタップしても不要な自動拡大が発生しない。
- ページ遷移後に表示倍率が不自然に残らない。
- フォーム UI が崩れない。

---

## 6.3 SearchHeader のロゴ位置が検索入力時に動く

### 現象

SearchHeader で検索文字を入力すると、`Auction` ロゴが固定されず、中央寄せの影響で位置が動く。

### 原因候補

- `items-center` や flex 配置により、入力欄や表示要素の幅変化がロゴ位置に影響している。
- ロゴ、検索欄、アイコンの領域幅が固定されていない。
- 入力中の候補表示やクリアボタン出現でレイアウトが変化している。

### 確認項目

- SearchHeader の DOM 構造を確認する。
- ロゴ部分の幅が固定されているか。
- 検索欄の幅変化がロゴに影響していないか。
- モバイルと PC の両方で破綻していないか。

### 修正方針

- header を左・中央・右の領域に分ける。
- ロゴ領域を固定幅または shrink しない領域にする。
- 検索欄は `flex-1` などで可変にする。
- 入力中も header 全体の高さ・横幅が変わらないようにする。

### 完了条件

- 検索入力中も Auction ロゴの位置が不自然に動かない。
- モバイルで UI が崩れない。
- PC でも最低限自然に表示される。

---

## 6.4 Search ページに取引完了商品が表示される

### 現象

取引が完了した商品が Search ページで検索対象に含まれてしまう。

### 確認項目

- Item / Product に取引状態を表すカラムがあるか。
- `trading_status` の値定義を確認する。
- Search API のクエリ条件を確認する。
- フロント側だけで除外していないか。
- DB クエリ段階で完了商品を除外しているか。

### 修正方針

- Search API 側で取引完了商品を除外する。
- 表示側だけでなく、バックエンドの検索条件に含める。
- 必要に応じて scope を追加する。

例：

```rb
scope :searchable, -> { where.not(trading_status: "completed") }
```

### 完了条件

- 取引完了商品が Search API の結果に含まれない。
- フロント検索画面でも表示されない。
- 既存の出品中・取引中商品は正常に表示される。

---

## 6.5 trading_status が更新されない

### 現象

取引の進行に応じて `trading_status` が変わらない。

### 確認項目

- 購入時に `trading_status` が更新されるか。
- 支払い・チャット開始・完了などの各タイミングで status 遷移が定義されているか。
- status 更新 API が存在するか。
- Rails 側の strong parameters で弾かれていないか。
- enum または validation の値とフロント送信値が一致しているか。
- トランザクション処理が途中で rollback されていないか。

### 修正方針

- status 遷移の状態定義を明確化する。
- 購入から完了までの処理で status を適切に更新する。
- 重要な更新は transaction で囲む。
- フロント送信値と Rails 側 enum の値を統一する。
- 完了処理時には Search 対象外になる状態へ変更する。

### 完了条件

- 購入時、取引中、完了時に status が正しく変化する。
- 完了後、Search ページに表示されない。
- 不正な status 遷移は拒否される。

---

## 6.6 Transaction ページの UI/UX が分かりにくい

### 現象

現在の取引ページはユーザーが設計を理解しづらく、使い勝手が悪い。

### 維持する要素

- メッセージ機能は維持する。

### 改善方針

メルカリなどの取引画面を参考に、購入から完了までの流れが直感的に分かる UI にする。

### 必要な表示要素

- 商品情報
- 出品者 / 購入者情報
- 現在の取引ステータス
- 次にやるべき操作
- メッセージ欄
- 取引完了ボタン
- 注意事項
- 取引履歴またはステータス履歴

### 確認項目

- ユーザーが今何をすべきか分かるか。
- 取引相手が誰か分かるか。
- 商品情報がすぐ確認できるか。
- メッセージ欄が使いやすいか。
- 完了操作が分かりやすいか。
- モバイルで見やすいか。

### 完了条件

- 取引画面を見れば現在の状態と次の操作が分かる。
- メッセージ機能が壊れていない。
- モバイルで操作しやすい。
- 取引完了までの導線が自然である。

---

# 7. その他の改善タスク

## 7.1 ホーム画面のハードコーディング除去

### 確認項目

- 固定の商品データやカテゴリデータが残っていないか。
- API から取得すべき内容がハードコーディングされていないか。

### 修正方針

- 必要なデータは API から取得する。
- ダミーデータは開発用であることを明確に分離する。

---

## 7.2 カテゴリ画像反映

### 確認項目

- カテゴリに画像情報があるか。
- API がカテゴリ画像 URL を返しているか。
- フロントでカテゴリ画像を表示しているか。

### 完了条件

- カテゴリ一覧やホームでカテゴリ画像が表示される。

---

## 7.3 値段交渉機能

### 目的

購入前に価格交渉ができる仕組みを追加または改善する。

### 確認項目

- 交渉モデルまたは API が存在するか。
- 出品者と購入希望者のやり取りが定義されているか。
- 承認・拒否・再提案の状態があるか。

### 完了条件

- 購入希望者が価格交渉を送れる。
- 出品者が承認・拒否できる。
- 承認後の購入フローにつながる。

---

## 7.4 購入 → チャット → 完了フロー

### 目的

購入後に取引チャットへ進み、最終的に取引完了できる流れを実装・改善する。

### 確認項目

- 購入時に取引データが作成されるか。
- 購入後にチャットページへ遷移できるか。
- チャットが取引単位で紐づいているか。
- 完了操作で `trading_status` が更新されるか。

### 完了条件

```txt
購入
  ↓
取引チャット
  ↓
取引完了
  ↓
Search から除外
```

が正常に動作する。

---

## 7.5 商品管理

### 確認項目

- 自分が出品した商品一覧を確認できるか。
- 編集・削除・公開停止ができるか。
- 取引中・完了済みの商品状態が分かるか。

---

## 7.6 商店機能

### 確認項目

- ユーザーごとのショップページがあるか。
- 出品中商品一覧が表示されるか。
- プロフィール情報と関連しているか。

---

## 7.7 履歴機能

### 確認項目

- 購入履歴
- 出品履歴
- 入札履歴
- 取引履歴

が必要に応じて確認できるか。

---

## 7.8 ブログ記事整備・ネクサス導入

### 確認項目

- ブログ記事の構成が整っているか。
- どの画面・機能に導入するのか明確か。
- 「ネクサス」が何を指すか、プロジェクト内の文脈で確認する。

注意：  
「ネクサス」の意味がコードや README から判断できない場合は、勝手に大規模実装せず、コメントまたは TODO として整理する。

---

# 8. 実務で意識する点

## 8.1 セキュリティ

- LocalStorage に認証トークンを保存しない。
- Cookie 属性を本番環境に合わせる。
- Rails 側で `authenticate_user!` を必ず使う。
- フロントの middleware だけを信用しない。
- `.env.local` を Git に含めない。
- API エラー時に不要な内部情報を返さない。
- プロフィール画像は DB 直保存しない。

## 8.2 UX

- ログイン・ログアウト・会員登録後にリロードを要求しない。
- SPA として状態を即時反映する。
- モバイル input で不要な自動拡大を起こさない。
- 取引ページでは「今何をすればよいか」を明確にする。
- 検索ヘッダーは入力中もレイアウトを安定させる。

## 8.3 保守性

- API 呼び出しを共通化する。
- 型定義を再利用する。
- utils に共通関数を配置する。
- Controller に業務ロジックを詰め込みすぎない。
- Model / Service に責務を分離する。
- 既存の設計を壊す大規模リファクタリングは避ける。

## 8.4 データ整合性

- 残高・ポイント更新は `with_lock` で排他制御する。
- 金銭的な値の更新は transaction を使う。
- 取引ステータスの不正遷移を防ぐ。
- 完了済み取引の商品が検索に残らないようにする。

---

# 9. エージェント実行ルール

## 9.1 最初に必ず行うこと

エージェントは修正前に必ず以下を行う。

1. 現在のブランチを確認する。
2. 変更差分が既に存在するか確認する。
3. 関連ファイルを検索する。
4. 既に対応済みかどうかを判断する。
5. 対応済みの場合は不要な変更をしない。
6. 未対応または不完全な場合のみ修正する。

確認コマンド例：

```bash
git status
git branch --show-current
```

検索例：

```bash
grep -R "UserInitializer" .
grep -R "create.*zustand\|zustand" .
grep -R "authenticate_user!" app/controllers
grep -R "access-token" .
grep -R "trading_status" .
grep -R "with_lock" app
```

---

## 9.2 修正時の原則

- 既存のディレクトリ構成・命名規則に合わせる。
- 影響範囲を必要最小限にする。
- 認証・取引・決済に近い処理は特に慎重に扱う。
- 既存機能を壊さない。
- 不明な仕様はコード上の実装・README・既存 UI を優先して判断する。
- 断定できないものは TODO コメントや修正報告で明記する。

---

## 9.3 テスト・確認

修正後は可能な範囲で以下を実行する。

Frontend：

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run test
```

Backend：

```bash
bundle install
rails db:migrate:status
rails test
bundle exec rspec
```

注意：  
プロジェクトに存在しないコマンドは無理に追加しない。  
`package.json`, `Gemfile`, `README` を確認し、実際に定義されているコマンドを使うこと。

---

# 10. 優先度順チェックリスト

## Priority A: 最優先

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] login 後にリロードなしで Zustand user が更新される
- [ ] signup 後にリロードなしで認証状態になる
- [ ] logout 後にリロードなしで user がクリアされる
- [ ] 本番環境で signup 後に login へ戻されない
- [ ] Next API Routes が Rails の認証レスポンスを正しく Cookie に保存している
- [ ] Cookie 名が `access-token`, `client`, `uid` で統一されている
- [ ] Cookie 属性が本番環境に合っている
- [ ] Rails 側の認証必須 API に `authenticate_user!` が設定されている
- [ ] Next middleware が認証必須ページを適切にガードしている
- [ ] UserInitializer が全ページで current user を初期化している

## Priority B: 重要

- [ ] API ラッパーで `res.ok` と JSON エラーを正しく処理している
- [ ] プロフィール更新後に Zustand が即時更新される
- [ ] 残高・ポイント更新後に Zustand が即時更新される
- [ ] 残高・ポイント更新に `with_lock` が使われている
- [ ] プロフィール画像が ActiveStorage で管理されている
- [ ] nickname 自動生成が `before_create` で行われている
- [ ] nickname unique index がある
- [ ] スマホ input フォーカス時に自動拡大されない
- [ ] SearchHeader のロゴ位置が入力中に動かない

## Priority C: 取引・商品関連

- [ ] 取引完了商品が Search に表示されない
- [ ] `trading_status` が購入・取引中・完了で正しく更新される
- [ ] 不正な status 遷移が防止されている
- [ ] 購入 → チャット → 完了 の流れが成立している
- [ ] Transaction ページで現在状態と次の操作が分かる
- [ ] メッセージ機能が維持されている

## Priority D: 今後の改善

- [ ] ホーム画面のハードコーディングを除去
- [ ] カテゴリ画像を反映
- [ ] 値段交渉機能を整理
- [ ] 商品管理機能を整理
- [ ] 商店機能を整理
- [ ] 履歴機能を整理
- [ ] ブログ記事を整備
- [ ] Pundit による認可の厳密化を検討
- [ ] N+1 対策を検討
- [ ] Background Job 導入を検討

---

# 11. 修正レポートに必ず書くこと

エージェントが作業後に報告する場合、以下の形式でまとめること。

```md
## 作業結果

### 調査した項目

- ...

### 対応済みだった項目

- ...

### 修正した項目

- ...

### 修正ファイル

- ...

### 動作確認

- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run build
- [ ] rails test / rspec
- [ ] 手動確認

### 未対応・保留

- ...

### 注意点

- ...
```

---

# 12. ポートフォリオ説明用まとめ

## 何を作ったか

モバイル利用を前提としたオークションサービスを開発しました。  
Next.js と Rails API を分離した構成で、認証、出品、検索、入札、取引管理までを実装しています。

## 技術スタック

- Frontend: Next.js / TypeScript
- Backend: Ruby on Rails 7 API Mode
- Database: PostgreSQL
- Auth: Devise / DeviseTokenAuth
- State Management: Zustand
- Storage: ActiveStorage
- Infrastructure: AWS EC2 / RDS
- CI/CD: GitHub Actions

## 設計方針

- DeviseTokenAuth によるトークン認証を採用
- 認証情報は LocalStorage ではなく Cookie で管理
- フロントでは Next middleware による軽量ガードを行う
- Rails 側では `authenticate_user!` により必ず認証検証を行う
- Zustand によりログインユーザー情報を一元管理
- `_app.tsx` の UserInitializer により全ページで user 情報を初期化
- API 呼び出しは Next API Routes と共通ラッパーで統一
- プロフィール画像は ActiveStorage で管理し、DB に直接保存しない
- 残高・ポイント更新は `with_lock` により排他制御する

## 工夫した点

- ログイン、会員登録、ログアウト後に SPA 的に状態が反映されるよう Zustand を活用
- Next API Routes を挟むことで Rails API との通信とエラー処理を整理
- DeviseTokenAuth の挙動を考慮し、nickname 自動生成は `before_validation` ではなく `before_create` で実行
- API レスポンス型やフォーム型を TypeScript で定義し、実装の安全性を高めた
- `formatNumber` などの共通処理を utils に分離し、再利用性を高めた

## 実務で意識した点

- LocalStorage にトークンを保存せず Cookie ベースにすることでセキュリティを意識
- フロントの middleware だけに頼らず Rails 側でも認証を必ず検証
- 金銭的な値の更新では `with_lock` を使い、二重更新を防止
- モバイルファーストで UI を設計
- 認証状態やプロフィール更新がリロードなしで反映される UX を重視

## 今後の改善点

- Pundit による認可の厳密化
- N+1 クエリ対策
- Background Job 導入
- 取引ページ UI/UX の改善
- 値段交渉機能
- 商品管理・商店・履歴機能の強化
- カテゴリ画像反映
- ホーム画面のハードコーディング除去

---

# 13. 最終ゴール

このプロジェクトで特に重視する最終状態は以下である。

```txt
会員登録 / ログイン / ログアウト
  ↓
Cookie と Zustand が正しく同期
  ↓
リロードなしで UI に即時反映
  ↓
Rails 側でも authenticate_user! により安全に検証
```

さらに、取引関連では以下を成立させる。

```txt
商品購入
  ↓
取引チャット
  ↓
取引完了
  ↓
trading_status 更新
  ↓
Search 対象外
```

この 2 つを最優先の品質基準として、既存実装を調査し、未対応箇所を安全に修正すること。

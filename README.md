```markdown
#　URL
https://auction.jongin.blog

# Auction

オークション形式の C2C マーケットプレイスです。  
商品の出品、検索、入札、購入、取引メッセージまでを一連で扱います。

## 概要

このプロジェクトは、個人間取引を想定したオークションサービスのフロントエンドです。

- 商品出品
- 商品検索
- 入札
- 即決購入
- 値段交渉
- 取引チャット
- 取引完了フロー

Rails API とフロントエンドを分離し、保守しやすい構成を意識しています。

## 設計

### 役割
- 商品の出品・検索・閲覧
- 値段交渉・入札・即決の 3 種の販売形態
- 購入後の取引メッセージ
- 評価・完了までのフロー管理

### 技術構成
- **Next.js 15**（Pages Router）
- **React 19**
- **Tailwind CSS**
- **Zustand**（ユーザー状態）
- **nextApi**（API 呼び出しラッパー）

### API 連携
- 自前の `/api/*` ルートが Rails API へのプロキシ
- Cookie を `credentials: "include"` で送受信
- 認証トークンは Next.js が Cookie に保存

### 画面構成
- `/` … トップ（終了間近・1円スタート・最近の落札）
- `/search` … 検索・カテゴリ・履歴
- `/items/[id]` … 商品詳細・入札・交渉
- `/user/profile` … マイページ
- `/transaction/[id]` … 取引・チャット

## 技術スタック

- Next.js 15.5
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React
- Swiper

## セットアップ

```bash
npm install
npm run dev
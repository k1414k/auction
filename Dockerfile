# ===================================================
# Next.js フロントエンド 用 Dockerfile
# マルチステージビルドで本番イメージを軽量化する
# ===================================================

# --- ステージ1: 依存パッケージのインストール ---
FROM node:20-alpine AS deps

# Alpine Linuxで一部のnpmパッケージが必要とするライブラリ
RUN apk add --no-cache libc6-compat

WORKDIR /app

# まず package.json と lockファイルだけをコピーする
# →ここが変わらなければ npm install はキャッシュされる
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# pnpm-lock.yaml があれば pnpm を使い、なければ npm を使う
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      npm ci; \   
    fi

# --- ステージ2: ビルド ---
FROM node:20-alpine AS builder

WORKDIR /app

# インストール済みの node_modules をコピー
COPY --from=deps /app/node_modules ./node_modules

# ソースコード全体をコピー
COPY . .

# Next.js を本番用にビルド（.next フォルダが生成される）
# NEXT_PUBLIC_* 変数はビルド時に埋め込まれるのでここで渡す
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# --- ステージ3: 本番用の最小イメージ ---
FROM node:20-alpine AS runner

WORKDIR /app

# セキュリティのため root 以外のユーザーで動かす
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js のスタンドアロン出力をコピー（必要なファイルだけ含む）
# ※ next.config.ts に output: 'standalone' が必要
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs   # 非rootユーザーに切り替え

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Next.js サーバーを起動
CMD ["node", "server.js"]

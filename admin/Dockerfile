# --- Stage 1: deps (開発環境でも使用) ---
  FROM node:20-alpine AS deps
  RUN apk add --no-cache libc6-compat
  WORKDIR /app
  
  # パッケージ管理ファイルのコピー
  COPY package.json package-lock.json* pnpm-lock.yaml* ./
  
  # 依存関係のインストール
  RUN if [ -f pnpm-lock.yaml ]; then \
        npm install -g pnpm && pnpm install --frozen-lockfile; \
      elif [ -f package-lock.json ]; then \
        npm ci; \
      else \
        npm install; \
      fi
  
  # --- Stage 2: builder (本番ビルド用) ---
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  
  # Nuxtのビルド（.output が生成される）
  RUN npm run build
  
  # --- Stage 3: runner (本番実行用) ---
  FROM node:20-alpine AS runner
  WORKDIR /app
  
  ENV NODE_ENV=production
  # Nuxt 3 はデフォルトで 3000 ポートを使うため環境変数で指定
  ENV PORT=3003
  ENV HOST=0.0.0.0
  
  RUN addgroup --system --gid 1001 nodejs && \
      adduser --system --uid 1001 nuxtjs
  
  # Nuxt 3 のビルド成果物は .output に集約される
  COPY --from=builder --chown=nuxtjs:nodejs /app/.output .
  
  USER nuxtjs
  
  EXPOSE 3003
  
  # Nuxt 3 の実行コマンド（server/index.mjs を叩く）
  CMD ["node", "server/index.mjs"]
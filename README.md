# Auction Monorepo

Rails API、ユーザー向け Next.js、管理画面 Nuxt をまとめた統合リポジトリです。

## Apps

```text
backend/   Rails API
frontend/  Auction web frontend
admin/     Admin web frontend
```

## Local Development

```bash
./scripts/local-up.sh
```

Open:

```text
frontend  http://localhost:3001
admin     http://localhost:3003
backend   http://localhost:3000/health
```

## Production On EC2

初回は `.env.example` を `.env` にコピーして値を埋めます。

```bash
cp .env.example .env
./scripts/deploy-ec2.sh
```

ローカルとEC2の使い分けは [ENVIRONMENT_GUIDE.md](ENVIRONMENT_GUIDE.md) を参照してください。EC2 デプロイ手順と運用コマンドは [DEPLOYMENT.md](DEPLOYMENT.md) にもまとめています。

## Analysis

統合前提での構造分析と改善方針は [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) にまとめています。

/** @type {import('next').NextConfig} */
const nextConfig = {
  // DockerコンテナでNext.jsを動かすために必要な設定
  // standalone モードにすると、node_modules全体ではなく必要なファイルだけが .next/standalone に入る
  // → Dockerイメージが軽くなる
  output: "standalone",

  images: {
    remotePatterns: [
      // ローカル開発時：Railsサーバーから画像を取得
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/rails/active_storage/**",
      },
      // 本番環境：S3バケットから直接画像を配信
      // S3_BUCKET_NAME と AWS_REGION を環境変数から取得して動的に設定
      {
        protocol: "https",
        hostname: `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-northeast-1"}.amazonaws.com`,
        pathname: "/**",
      },
      // 本番のRailsサーバー（EC2のIPやドメイン）からも画像取得できるように
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_API_HOST || "localhost",
        pathname: "/rails/active_storage/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOST || "localhost",
        pathname: "/rails/active_storage/**",
      },
    ],
  },
};

module.exports = nextConfig;

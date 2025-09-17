
// import '@/styles/globals.css';
// import type { AppProps } from 'next/app';

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;

// }

// app/layout.tsx
import "@/styles/globals.css";
import { Header } from "@/components/Header";
import { AppProps } from "next/app";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "Auction (mock)",
  description: "Auction mock - mobile-first UI",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen text-gray-800">
        <div className="max-w-screen-sm mx-auto">
          <Header />
          <main className="pb-24"> {/* 下部ナビ分の余白 */}
            <Component {...pageProps} />
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

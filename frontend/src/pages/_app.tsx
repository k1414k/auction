import "@/styles/globals.css";
import { AppProps } from "next/app";
import { BottomNav } from "@/components/BottomNav";
import { PCNav } from "@/components/PCNav";
import { UserInitializer } from "@/components/UserInitializer";
import { SearchHeader } from "@/components/SearchHeader";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

export const metadata = {
  title: "Auction (mock)",
  description: "Auction mock - mobile-first UI",
};

function useScrollToTopOnRouteChange() {
  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    router.events.on("routeChangeComplete", handler);

    return () => {
      router.events.off("routeChangeComplete", handler);
    };
  }, [router]);
}

function HeaderActionLinks() {
  return (
    <nav className="flex items-center gap-2 shrink-0">

        <Link
          href={"/sell"}
          className="inline-flex items-center justify-center rounded-lg font-bold px-4 py-2 text-sm text-red-500 hover:text-red-700"
        >
          まずは出品する
        </Link>
        <Link
          href={"/auth/sign-in"}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 hover:text-slate-600"
        >
          ログイン
        </Link>
        <Link
          href={"/auth/register"}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-slate-700 px-4 py-2 text-sm font-bold text-white transition"
        >
          会員登録
        </Link>
        
    </nav>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  useScrollToTopOnRouteChange();

  return (
    <UserInitializer>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-[960px] mx-auto">
          {/* PC用: デフォルト表示 */}
          <div className="px-6 py-3 flex items-center gap-6 lg:hidden">
            <div className="shrink-0">
              <LogoHeader />
            </div>

            <div className="flex-1 flex justify-center min-w-0">
              <div className="w-full max-w-[560px]">
                <SearchHeader />
              </div>
            </div>

            <HeaderActionLinks />
          </div>

          {/* 1280px以下: mobileUI */}
          <div className="hidden lg:flex px-4 py-3 gap-3 items-start">
            <div className="shrink-0 pt-0.5">
              <LogoHeader />
            </div>
            <SearchHeader />
          </div>
        </div>

        <PCNav />
      </header>

      <div className="bg-gray-50 min-h-screen text-gray-800">
        <main className="max-w-[1280px] mx-auto pt-4 pb-4 md:pb-24">
          <Component {...pageProps} />
        </main>
      </div>

      <BottomNav />
    </UserInitializer>
  );
}
import "@/styles/globals.css";
import { AppProps } from "next/app";
import { BottomNav } from "@/components/BottomNav";
import { PCNav } from "@/components/PCNav";
import { UserInitializer } from "@/components/UserInitializer";
import { SearchHeader } from "@/components/SearchHeader";
import LogoHeader from "@/components/LogoHeader";
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

export default function App({ Component, pageProps }: AppProps) {
  useScrollToTopOnRouteChange();

  return (
    <UserInitializer>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-[1420px] mx-auto px-4 py-3 flex gap-3 items-start">
          <div className="shrink-0 pt-0.5">
            <LogoHeader />
          </div>
          <SearchHeader />
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

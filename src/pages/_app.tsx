import "@/styles/globals.css";
import { AppProps } from "next/app";
import { BottomNav } from "@/components/BottomNav";
import { UserInitializer } from "@/components/UserInitializer";
import { SearchHeader } from "@/components/SearchHeader";
import LogoHeader from "@/components/LogoHeader";

export const metadata = {
  title: "Auction (mock)",
  description: "Auction mock - mobile-first UI",
};

export default function App({ Component, pageProps }: AppProps) {

  return (
      <UserInitializer>
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b px-20 sm:px-0 ">
          <div className="px-4 py-3 flex gap-3">
            <LogoHeader />
            <SearchHeader />
          </div>
        </header>
        <div className="bg-gray-50 min-h-screen text-gray-800 max-w-screen-lg mx-auto">
              <main className="pt-4 pb-24">
                <Component {...pageProps} />
              </main>
            <BottomNav />
        </div>
      </UserInitializer>
  );
}
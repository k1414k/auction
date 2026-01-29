import "@/styles/globals.css";
import { AppProps } from "next/app";
import { BottomNav } from "@/components/BottomNav";
import { UserInitializer } from "@/components/UserInitializer";
import { SearchHeader } from "@/components/SearchHeader";

export const metadata = {
  title: "Auction (mock)",
  description: "Auction mock - mobile-first UI",
};

export default function App({ Component, pageProps }: AppProps) {

  return (
      <UserInitializer>
        <SearchHeader />
        <div className="bg-gray-50 min-h-screen text-gray-800">
          <div className="max-w-screen-xl mx-auto">
              <main className="pb-24" id="scroll-container">
                <Component {...pageProps} />
              </main>
            <BottomNav />
          </div>
        </div>
      </UserInitializer>
  );
}
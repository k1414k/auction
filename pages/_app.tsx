import "@/styles/globals.css";
import { AppProps } from "next/app";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { UserInitializer } from "@/components/UserInitializer";

export const metadata = {
  title: "Auction (mock)",
  description: "Auction mock - mobile-first UI",
};

export default function App({ Component, pageProps }: AppProps) {

  return (
      <UserInitializer>
        <div className="bg-gray-50 min-h-screen text-gray-800">
          <div className="max-w-screen-xl mx-auto">
            <Header />
            <main className="pb-24">
              <Component {...pageProps} />
            </main>
            <BottomNav />
          </div>
        </div>
      </UserInitializer>
  );
}
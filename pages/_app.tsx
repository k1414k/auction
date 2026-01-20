// app/_app.tsx
import "@/styles/globals.css";
import { AppProps } from "next/app";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { UserInitializer } from "@/components/UserInitializer";
import { useRouter } from "next/router";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useState } from "react"; // 1. Import useEffect

export const metadata = {
  title: "Auction (mock)",
  description: "Auction mock - mobile-first UI",
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Note: router.pathname is available, but performing actions is not safe during render
  const isAdminPage = router.pathname.startsWith("/admin");

  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  // 2. Add a hydration check state (optional but recommended to prevent hydration mismatches)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Move the navigation logic inside useEffect
  useEffect(() => {
    // Only run this logic if the router is ready and we are on the client
    if (isAdminPage && !isAdmin) {
      router.replace("/");
    }
  }, [isAdminPage, isAdmin, router]);

  // 4. Prevent "Flashing" of protected content
  // If it's an admin page and the user isn't an admin, don't render the component
  // while we wait for the useEffect to redirect them.
  if (isAdminPage && !isAdmin) {
    return null; // Or return a <Loading /> spinner
  }

  // Admin Page Layout (Authenticated Admin)
  if (isAdminPage) {
    return (
        <UserInitializer>
          <Component {...pageProps} />
        </UserInitializer>
    );
  }

  // Standard User Layout
  return (
      <UserInitializer>
        <div className="bg-gray-50 min-h-screen text-gray-800">
          <div className="max-w-screen-sm mx-auto">
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
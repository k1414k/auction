// components/BottomNav.tsx
"use client";
import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-screen-sm bg-white/95 border rounded-xl shadow-lg z-50">
      <div className="flex justify-around py-2">
        <Link href="/" className="flex flex-col items-center text-xs">
          <span>🏠</span>
          <span>ホーム</span>
        </Link>
        <Link href="/visual" className="flex flex-col items-center text-xs">
          <span>🔍</span>
          <span>注目</span>
        </Link>
        <Link href="/mypage" className="flex flex-col items-center text-xs">
          <span>📅</span>
          <span>マイページ</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center text-xs">
          <span>💰</span>
          <span>残高</span>
        </Link>
      </div>
    </nav>
  );
}

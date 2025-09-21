// components/BottomNav.tsx
"use client";
import Link from "next/link";
import { House,Tally2,Table,Table2 } from "lucide-react";


export function BottomNav() {

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] 
    max-w-screen-sm bg-white/95 border rounded-xl shadow-lg z-50">
      <div className="flex justify-around py-2 cursor-pointer">
        <Link href="/" className="flex flex-col items-center text-xs cursor-pointer">
          <House className="" />
          <span>ホーム</span>
        </Link>
        <Link href="/a" className="flex flex-col items-center text-xs">
          <Tally2 />
          <span>注目</span>
        </Link>
        <Link href="/b" className="flex flex-col items-center text-xs">
          <Table />
          <span>マイページ</span>
        </Link>
        <Link href="/c" className="flex flex-col items-center text-xs">
          <Table2 />
          <span>残高</span>
        </Link>
      </div>
    </nav>
  );
}

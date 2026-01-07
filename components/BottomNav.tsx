"use client";
import Link from "next/link";
import { House, List, Ellipsis, CirclePlus, CircleUser } from "lucide-react";


export function BottomNav() {
  class Button {
    btnNames = ["ホーム","リスト","販売","ログイン","メニュ"];
    create(i:number){
      if (this.btnNames[i]){
        
      }
    }
  }

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] 
    max-w-screen-sm bg-white/95 border rounded-xl shadow-lg z-50">
      <div className="flex justify-around py-2 cursor-pointer">
        <Link href="/" className="flex flex-col items-center text-xs cursor-pointer">
          <House className="/" />
          <span>ホーム</span>
        </Link>
        <Link href="/list" className="flex flex-col items-center text-xs">
          <List />
          <span>リスト</span>
        </Link>
        <Link href="#" className="flex flex-col items-center text-xs">
          <CirclePlus />
          <span>販売</span>
        </Link>
        <Link href="/auth/login" className="flex flex-col items-center text-xs">
          <CircleUser />
          <span>
            ログイン
          </span>
        </Link>
        <div className="flex flex-col items-center text-xs">
          <Ellipsis />
          <span>メニュ</span>
        </div>
      </div>
    </nav>
  );
}

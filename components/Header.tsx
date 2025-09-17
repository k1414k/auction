// components/Header.tsx
"use client";
import { useState } from "react";

export function Header() {
//   const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="text-xl font-bold text-slate-800">Auction</div>
        <div className="flex-1">
          <input
            // value={q}
            // onChange={(e) => setQ(e.target.value)}
            placeholder="検索（例：MacBook）"
            className="w-full bg-gray-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>
    </header>
  );
}

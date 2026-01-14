// components/SearchTop.tsx
"use client";

import { useRouter } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";

export function SearchTop() {
    const router = useRouter();

    const pushSearch = (q: string) => {
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <>
            {/* 検索バー */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        placeholder="キーワードから探す"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") pushSearch(e.currentTarget.value);
                        }}
                        className="w-full rounded-xl py-3 pl-12 shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            {/* 急上昇 */}
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 flex gap-2">
                    <TrendingUp size={16} /> 急上昇
                </h2>
                {["PS5 本体", "MacBook Pro"].map((w) => (
                    <button
                        key={w}
                        onClick={() => pushSearch(w)}
                        className="block w-full text-left p-3 bg-white rounded-xl mt-2"
                    >
                        {w}
                    </button>
                ))}
            </section>

            {/* カテゴリ */}
            <section>
                <h2 className="text-sm font-bold text-gray-500 mb-3">カテゴリ</h2>
                <div className="grid grid-cols-2 gap-3">
                    {["PC", "スマホ", "ゲーム"].map((c) => (
                        <button
                            key={c}
                            onClick={() => router.push(`/search?category=${c}`)}
                            className="bg-white p-4 rounded-xl shadow-sm"
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </section>
        </>
    );
}

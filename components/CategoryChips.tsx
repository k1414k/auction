// components/CategoryChips.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = ["PC", "スマホ", "タブレット", "周辺機器"];

export function CategoryChips() {
    const router = useRouter();
    const params = useSearchParams();

    const onSelect = (category: string) => {
        const p = new URLSearchParams(params.toString());
        p.set("category", category);
        router.push(`/search?${p.toString()}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto mb-4">
            {categories.map((c) => {
                const active = params.get("category") === c;

                return (
                    <button
                        key={c}
                        onClick={() => onSelect(c)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap
              ${active ? "bg-blue-600 text-white" : "bg-white text-gray-700"}
            `}
                    >
                        {c}
                    </button>
                );
            })}
        </div>
    );
}

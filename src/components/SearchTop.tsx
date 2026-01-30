import { Trash2 } from "lucide-react";
import {AuctionCard} from "@/components/AuctionCard";
import Link from "next/link";
import { Item } from "@/types/item";
import { Category } from "@/types/category";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type SearchTopProps = {
  categories: Category[];
  items: Item[];
};

export function SearchTop({categories, items}:SearchTopProps
) {
    const router = useRouter();
    const [history, setHistory] = useState([]);

    const findHistory = () => {
        setHistory(JSON.parse(localStorage.getItem('search_history') || '[]').slice(0,14));
    };
    const deleteHistoryItem = (q: string) => {
        const currentHistory: string[] = JSON.parse(localStorage.getItem('search_history') || '[]');
        const newHistory = currentHistory.filter(item => item !== q);
            localStorage.setItem('search_history', JSON.stringify(newHistory));
            findHistory(); // ステートを再更新して画面に反映
    };

    const pushSearch = (q: string) => {
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    useEffect(()=>{
        findHistory()
    }, [])

    return (
        <>
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 mb-3">
                    検索履歴
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-2 gap-2">
                    {history.map((w) => (
                        <div 
                            key={w} 
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-md overflow-hidden hover:bg-slate-50 transition-colors"
                        >
                            {/* 検索実行エリア */}
                            <div
                                className="flex-1 p-2 cursor-pointer truncate text-sm"
                                onClick={() => pushSearch(w)}
                            >
                                <span className="text-gray-400 mr-1">》</span>
                                <span className="text-gray-700">{w}</span>
                            </div>
                            
                            {/* 削除ボタンエリア */}
                            <button
                                onClick={() => deleteHistoryItem(w)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="削除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h2 className="text-sm font-bold text-gray-500 mb-3">カテゴリ</h2>
                <div className="grid grid-cols-2 gap-3">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => router.push(`/search?category=${c.name}`)}
                            className="bg-white p-4 rounded-xl shadow-sm text-center font-medium hover:ring-2 ring-blue-500 transition-all"
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </section>

            <section className="mt-5">
                <h2 className="text-sm font-bold text-gray-500 mb-3">新着順</h2>
                <div className="grid grid-cols-4 gap-4 md:grid-cols-3 md:gap-2 sm:grid-cols-2">
                    {
                        items.map(item=>(
                            <Link key={item.id} href={`/items/${item.id}`}>
                                <AuctionCard item={item} />
                            </Link>
                        ))
                    }
                </div>
            </section>

        </>
    );
}

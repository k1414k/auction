import React, { useEffect, useState } from 'react';
import { Heart, Clock, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Item } from '@/types/item';
import { nextApi } from '@/lib/fetch';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { apiAssetUrl } from '@/lib/apiAssetUrl';
import { readViewHistory, type ViewHistoryItem } from '@/utils/view-history';

const sortOptions: Array<{ value: SortMode; label: string }> = [
    { value: "recent", label: "新しい順" },
    { value: "price_low", label: "価格が安い順" },
    { value: "price_high", label: "価格が高い順" },
];

type SortMode = 'recent' | 'price_low' | 'price_high';

export default function FavoritesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'likes' | 'history'>('likes');
    const [items, setItems] = useState<Item[]|[]>([]);
    const [historyItems, setHistoryItems] = useState<ViewHistoryItem[]>([]);
    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const getItems = async()=> {
        try {
            type ResType = {
                data: Item[]
            }
            const res:ResType = await nextApi("/items", {
                method: "GET"
            })
            setItems(res.data.filter(item=>{
                if (item.is_favorited) return true;
                else return false;
            }))
        }
        catch (e) {
            if (e instanceof Error){
                console.log(e.message);
            }
            else alert("SERVER ERR 500")
        }
    }
    
    useEffect(()=>{
        getItems()
    }, [])
    useEffect(()=>{
        if (typeof window === "undefined") return;
        const syncHistory = () => setHistoryItems(readViewHistory());
        syncHistory();
        window.addEventListener("focus", syncHistory);
        window.addEventListener("storage", syncHistory);

        return () => {
            window.removeEventListener("focus", syncHistory);
            window.removeEventListener("storage", syncHistory);
        };
    },[])

    const sortedLikes = sortCards(items);
    const sortedHistory = sortCards(historyItems);

    function sortCards<T extends { price: number; viewed_at?: string; created_at?: string }>(list: T[]) {
        return [...list].sort((a, b) => {
            if (sortMode === 'price_low') return a.price - b.price;
            if (sortMode === 'price_high') return b.price - a.price;
            const aDate = new Date(a.viewed_at ?? a.created_at ?? 0).getTime();
            const bDate = new Date(b.viewed_at ?? b.created_at ?? 0).getTime();
            return bDate - aDate;
        });
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            {/* ヘッダーエリア */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-screen-xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-black text-gray-900">マイリスト</h1>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setFilterMenuOpen((open) => !open)}
                                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                                aria-expanded={filterMenuOpen}
                                title="表示順"
                            >
                                <SlidersHorizontal size={18} className="text-gray-600" />
                                {sortLabel(sortMode)}
                            </button>
                            {filterMenuOpen && (
                                <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 text-sm shadow-lg">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setSortMode(option.value);
                                                setFilterMenuOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between px-4 py-2 text-left font-bold transition-colors hover:bg-gray-50 ${
                                                sortMode === option.value ? "text-blue-600" : "text-gray-600"
                                            }`}
                                        >
                                            <span>{option.label}</span>
                                            {sortMode === option.value && <span className="text-xs">選択中</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* タブ切り替え（PCでは幅を制限） */}
                    <div className="flex bg-gray-100 p-1 rounded-xl max-w-md mx-auto gap-2">
                        <button
                            onClick={() => setActiveTab('likes')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                                activeTab === 'likes' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            <Heart size={16} fill={activeTab === 'likes' ? 'currentColor' : 'none'} />
                            いいね！
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all relative ${
                                activeTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            <Clock size={16} />
                            閲覧履歴
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-screen-xl mx-auto p-4">
                {activeTab === 'likes' && sortedLikes.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3 sm:gap-5">
                        {sortedLikes.map((i) => (
                            <Link 
                                href={`/items/${i.id}`} 
                                key={i.id} 
                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-100"
                            >
                                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                    <Image 
                                        src={apiAssetUrl(i.image)}
                                        alt={i.title}
                                        // height={100}
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-gray-100 to-gray-200" 
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate mb-1.5">
                                        {i.title}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : activeTab === 'history' && sortedHistory.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3 sm:gap-5">
                        {sortedHistory.map((i) => (
                            <Link
                                href={`/items/${i.id}`}
                                key={i.id}
                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-100"
                            >
                                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                    {i.image && (
                                        <Image
                                            src={apiAssetUrl(i.image)}
                                            alt={i.title}
                                            fill
                                            unoptimized
                                            className="object-cover group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-gray-100 to-gray-200"
                                        />
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate mb-1.5">
                                        {i.title}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            表示できる商品がありません
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            {
                                activeTab === "likes" ?
                                "まだお気に入りした商品がありません。気に入った商品にいいねをつけてみましょう。"
                                :
                                "商品詳細を見ると、ここに閲覧履歴が表示されます。"

                            }
                        </p>
                        <button 
                            onClick={() => router.push("/search")}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
                        >
                            商品を見に行く
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function sortLabel(mode: SortMode) {
    return {
        recent: "新しい順",
        price_low: "価格が安い順",
        price_high: "価格が高い順",
    }[mode];
}

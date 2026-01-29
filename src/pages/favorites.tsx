import React, { useState } from 'react';
import { Heart, Clock, ChevronLeft, Trash2, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
    
    // <button
    //     onClick={() => setActiveTab('history')}
    //     className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${
    //         activeTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
    //     }`}
    // >
    //     <Clock size={16} />
    //     閲覧履歴
    // </button>
    
    const [activeTab, setActiveTab] = useState<'likes' | 'history'>('likes');

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            {/* ヘッダー部分：プロフィールの要素を取り入れたリッチなデザイン */}
                
                {/* タブ切り替え */}
                <div className="flex bg-gray-100 p-1 rounded-2xl relative mt-4">
                    
                    <button
                        onClick={() => setActiveTab('likes')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${
                            activeTab === 'likes' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                        }`}
                    >
                        <Heart size={16} fill={activeTab === 'likes' ? 'currentColor' : 'none'} />
                        いいね！
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all z-10 ${
                            activeTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                        }`}
                    >
                        <Clock size={16} />
                        閲覧履歴
                    </button> */}
            </div>

            {/* メインコンテンツ */}
            <main className="p-4">
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Link href={`/items/${i}`} key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm active:scale-95 transition-transform border border-white hover:border-blue-100">
                            <div className="aspect-square bg-gray-100 relative">
                                {/* 閲覧履歴のときだけ、「○時間前」などの情報を出すとより便利 */}
                                {activeTab === 'history' && (
                                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md text-[9px] text-white px-2 py-1 rounded-full">
                                        3時間前に閲覧
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-400 font-medium mb-1 truncate">カテゴリ名</p>
                                <p className="text-sm font-bold text-gray-800 truncate mb-2">商品タイトルがここに入ります</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-blue-600">¥12,800</p>
                                    <Heart size={14} className={activeTab === 'likes' ? 'text-pink-500 fill-pink-500' : 'text-gray-200'} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
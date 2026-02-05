import React, { useEffect, useState } from 'react';
import { Heart, Clock, Trash2, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Item } from '@/types/item';
import { nextApi } from '@/lib/fetch';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function FavoritesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'likes' | 'history'>('likes');
    const [items, setItems] = useState<Item[]|[]>([]);
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

        console.log({
            items:items
        
    });
    },[items]
        
    )

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            {/* ヘッダーエリア */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-screen-xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-black text-gray-900">マイリスト</h1>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <SlidersHorizontal size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* タブ切り替え（PCでは幅を制限） */}
                    <div className="flex bg-gray-100 p-1 rounded-xl max-w-md mx-auto">
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
                {activeTab === 'likes' && items.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3 sm:gap-5">
                        {items && items.map((i) => (
                            <Link 
                                href={`/items/${i.id}`} 
                                key={i.id} 
                                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-100"
                            >
                                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                    {/* ダミー画像代わりのグレーボックス */}
                                    <Image 
                                        src={i.image}
                                        alt={i.title}
                                        fill
                                        // height={100}
                                        className="w-full h-full group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-gray-100 to-gray-200" 
                                    />
                                    
                                    {/* 削除機能 */}
                                    {/* <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button> */}
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
                                "現在この機能を開発しています。お気に入りに登録した商品は「いいね！」タブからご確認いただけます。"

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
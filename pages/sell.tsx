import React, { useEffect, useState } from 'react';
import { Camera, X, ChevronRight } from 'lucide-react';
import { nextApi } from '@/lib/fetch';
import { SelectRow } from '@/components/SelectRow';

export default function SellPage() {
    const [images, setImages] = useState<string[]>([]);
    const [price, setPrice] = useState('');
    const [categories, setCategories] = useState([])
    const [categoryId, setCategoryId] = useState<number | "">("");

        const getCategories = async() => {
            try {
                type ResType = {data:[]}
                const res:ResType = await nextApi("/categories", {method:"GET"})
                setCategories(res.data)
                console.log(categories);
                
            }   
            catch (e){
                if (e instanceof Error){
                    const errorMessage= JSON.parse(e.message)
                    console.log(errorMessage);
                }
                else {
                    alert("ERR_CODE_500")
                }
            }
        }
        useEffect(()=>{
            getCategories()
        }    
        ,[])
    

    return (
        <div className="min-h-screen bg-gray-50 pb-32 pt-20 px-4">
            <h1 className="text-xl font-bold text-gray-800 mb-6 px-1">商品の出品</h1>

            {/* 画像アップロードエリア */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                <button className="flex-shrink-0 w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition">
                    <Camera size={24} className="mb-1" />
                    <span className="text-xs font-bold">0/10</span>
                </button>
                {/* アップロードされた画像のプレビュー（ダミー） */}
                {[1, 2].map((i) => (
                    <div key={i} className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">img_{i}</div>
                        <button className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {/* 入力フォーム */}
            <div className="space-y-4">
                {/* 商品名・説明 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">商品名</label>
                        <input
                            type="text"
                            className="w-full text-lg font-bold border-b border-gray-200 py-2 focus:border-blue-500 outline-none placeholder-gray-300"
                            placeholder="商品名を入力"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">商品の説明</label>
                        <textarea
                            className="w-full text-sm text-gray-700 h-32 resize-none outline-none placeholder-gray-300"
                            placeholder="色、素材、重さ、定価、注意点などを入力してください"
                        ></textarea>
                    </div>
                </div>
                
                <SelectRow
                    label="カテゴリ"
                    value={categoryId}
                    options={categories}
                    onChange={setCategoryId}
                />

                {/* 詳細設定（セレクトボックス風） */}
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
                    {['カテゴリ', '商品の状態', '配送について'].map((label, idx) => (
                        <button key={idx} className="w-full flex items-center justify-between p-4 active:bg-gray-50 text-left">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <div className="flex items-center gap-2 text-gray-400">
                                <span className="text-xs">選択してください</span>
                                <ChevronRight size={16} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* 価格設定 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <label className="font-bold text-gray-700">販売価格</label>
                    <div className="flex items-center gap-2 border-b-2 border-transparent focus-within:border-blue-500 pb-1 transition">
                        <span className="text-gray-400 text-xl font-bold">¥</span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-32 text-right text-2xl font-bold text-gray-800 outline-none placeholder-gray-200"
                            placeholder="0"
                        />
                    </div>
                </div>
                <button className="pointer-events-auto w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition transform">
                    出品する
                </button>
            </div>
        </div>
    );
}
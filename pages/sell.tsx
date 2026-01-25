import { useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { nextApi } from '@/lib/fetch';
import { SelectRow } from '@/components/SelectRow';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CONDITION_OPTIONS = [
    { id: 0, name: "新品、未使用" },
    { id: 1, name: "未使用に近い" },
    { id: 2, name: "目立った傷や汚れなし" },
    { id: 3, name: "やや傷や汚れあり" },
]

export default function SellPage() {
    const [categories, setCategories] = useState([]) // apiからまずもらう

    const router = useRouter()
    const [images, setImages] = useState<File[]>([])
    const [form, setForm] = useState({
        title: "",
        description: "",
        category_id: 0,
        price: 0,
        condition: 0,
    });
    const formHandler = async() => {
        const formData = new FormData()
        formData.append("title", form.title)
        formData.append("description", form.description)
        formData.append("category_id", String(form.category_id))
        formData.append("price", String(form.price))
        formData.append("condition", String(form.condition))

        images.forEach(file=>{
            formData.append("images", file)
        })
        
        try {
            const res = await fetch("/api/items/create", {
                method:"POST",
                body: formData
            })

            if (res.ok) router.replace('/search')
        }
        catch (e){
            if (e instanceof Error){
                const errorMessage= JSON.parse(e.message)
                console.log(errorMessage);
            }
        }
    }
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
    
    useEffect(()=>{
        console.log(images);
    }    
    ,[images])
    

    return (
        <div className="min-h-screen bg-gray-50 pb-32 pt-20 px-4">
            <h1 className="text-xl font-bold text-gray-800 mb-6 px-1">商品の出品</h1>

            {/* 画像アップロードエリア */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                <label className="cursor-pointer flex-shrink-0 w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition">
                    <Camera size={24} className="mb-1" />
                    <span className="text-xs font-bold">0/10</span>

                    <input type="file" className="hidden" onChange={e=>{
                        const newFile = e.target.files?.[0]
                        if (!newFile) return
                        setImages(prev=>[...prev, newFile])
                    }}
                        accept="image/*"
                    />
                    {/* multipleオプションを使わず配列に一つずつ追加する形 */}
                </label>
                {/* アップロードされた画像のプレビュー */}
                {images.map((file, index) => {
                    
                    const imageUrl = URL.createObjectURL(file)

                    return (
                        <div key={index} className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-xl relative overflow-hidden group">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                <Image src={imageUrl} 
                                    fill
                                    alt='Image'
                                />
                            </div>
                            <button className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white"
                                onClick={()=>{ // アップロード画像削除
                                    setImages(prev => [...prev.slice(0, index),
                                        ...prev.slice(index + 1)]);
                                    // メモリ解放（URL.createObjectURL の）
                                    URL.revokeObjectURL(imageUrl);
                                }}  
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* 入力フォーム */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">商品名</label>
                        <input
                            type="text"
                            className="w-full text-lg font-bold border-b border-gray-200 py-2 focus:border-blue-500 outline-none placeholder-gray-300"
                            placeholder="商品名を入力"
                            onChange={e=>setForm({...form, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">商品の説明</label>
                        <textarea
                            className="w-full text-sm text-gray-700 h-32 resize-none outline-none placeholder-gray-300"
                            placeholder="色、素材、重さ、定価、注意点などを入力してください"
                            onChange={e=>setForm({...form, description: e.target.value})}
                        ></textarea>
                    </div>
                </div>

                {/* select選択 */}
                <SelectRow
                    label="カテゴリ"
                    value={form.category_id}
                    options={categories}
                    onChange={v=>setForm({...form, category_id: v})}
                />
                <SelectRow
                    label="商品の状態"
                    value={form.condition}
                    options={CONDITION_OPTIONS} // ここに最初定義した配列を渡してることでapiなど不要
                    onChange={v => setForm({ ...form, condition: v })}
                />

                {/* 価格設定 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <label className="font-bold text-gray-700">販売価格</label>
                    <div className="flex items-center gap-2 border-b-2 border-transparent focus-within:border-blue-500 pb-1 transition">
                        <span className="text-gray-400 text-xl font-bold">¥</span>
                        <input
                            // value={form.price}
                            // onChange={(e) => setForm({...form, price: Number(e.target.value)})}
                            className="w-32 text-right text-2xl font-bold text-gray-800 outline-none placeholder-gray-200"
                            placeholder="0"
                            type="text" // numberではなくtextにする
                            inputMode="numeric" // スマホで数字キーボードを出す
                            pattern="\d*" // iOSなどで数字キーボードを確実に出す
                            value={form.price === 0 ? "" : form.price.toLocaleString()} // 表示用にカンマ区切りにしても良い（任意）
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, ""); // カンマを除去
                                
                                // 1. 全角数字を半角に変換し、数字以外をすべて削除するマジック
                                const sanitized = rawValue
                                    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角→半角
                                    .replace(/\D/g, ""); // 数字以外を削除

                                setForm({ ...form, price: Number(sanitized) });
                            }}
                        />
                    </div>
                </div>
                <button
                    className="pointer-events-auto w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition transform"
                    onClick={formHandler}
                >
                    出品する
                </button>
            </div>
        </div>
    );
}
import { nextApi } from '@/lib/fetch';
import { Item } from '@/types/item';
import { ChevronLeft, ChevronRight, CreditCard, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
    const router = useRouter()
    const { id } = router.query
    const [item,setItem] = useState<Item|null>(null)

    useEffect(() => {
        if (!id) return;
        
        const getItem = async() => {
            try {
                type ResType = {data:Item}
                const res:ResType = await nextApi(`/items/${id}`, {method:"GET"})
                console.log(res.data);
                
                setItem(res.data);
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

        getItem()
    }, [id])

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            <header className="h-16 bg-white flex items-center px-4 sticky top-0 z-10 border-b">
                <Link href={`/items/${id}`}><ChevronLeft className="text-gray-600" /></Link>
                <h1 className="flex-1 text-center font-bold mr-6">購入内容の確認</h1>
            </header>

            <main className="p-4 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold line-clamp-2">{item?.title}</p>
                        <p className="text-lg font-bold">¥{item?.price}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <MapPin size={20} className="text-gray-400" />
                            <div className="text-left"><p className="text-xs text-gray-400">配送先</p><p className="text-sm font-medium">東京都渋谷区神南1-2-3</p></div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <CreditCard size={20} className="text-gray-400" />
                            <div className="text-left"><p className="text-xs text-gray-400">支払い方法</p><p className="text-sm font-medium">クレジットカード (**** 1234) / 売上高 / ポイント</p></div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex justify-between text-sm text-gray-500"><span>商品代金</span><span>¥{item?.price}</span></div>
                    <div className="flex justify-between text-sm text-gray-500"><span>配送料</span><span>無料</span></div>
                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-dashed"><span>支払い金額</span><span>¥{item?.price}</span></div>
                </div>

                <button className="w-full bg-blue-500 text-white font-bold py-5 rounded-full shadow-xl shadow-blue-100 active:scale-[0.98] transition mt-4">
                    購入を確定する
                </button>
            </main>
        </div>
    );
}
import { Heart, ChevronLeft, Share, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
    return (
        <div className="bg-white min-h-screen pb-32">
            <div className="fixed top-0 w-full flex justify-between p-4 z-10">
                <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white"><ChevronLeft /></button>
                <button className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white"><Share size={20} /></button>
            </div>

            <div className="aspect-square bg-gray-100 w-full flex items-center justify-center text-gray-300">Image Area</div>

            <div className="p-5 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-gray-800">高性能ワイヤレスイヤホン</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-bold text-gray-900">¥15,800 <span className="text-sm font-normal text-gray-400">送料込み</span></p>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                            <Heart size={18} className="text-pink-500" />
                            <span className="text-sm font-bold">24</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 text-sm">
                        <p className="font-bold">出品者名</p>
                        <p className="text-gray-500 text-xs">本人確認済み</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                </div>

                <section className="space-y-3">
                    <h2 className="font-bold text-gray-800">商品説明</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        半年ほど使用しました。目立った傷はなく非常に綺麗な状態です。付属品はすべて揃っています。
                    </p>
                </section>
            </div>

            <div className="mt-4 p-4 bg-white/80 backdrop-blur-md border-t flex gap-3">
                <button className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-full active:scale-95 transition shadow-lg">
                    コメント
                </button>
                <Link href="/items/1/checkout" className="flex-[2]">
                    <button className="w-full bg-blue-500 text-white font-bold py-4 rounded-full active:scale-95 transition shadow-lg shadow-blue-200">
                        購入手続きへ
                    </button>
                </Link>
            </div>
        </div>
    );
}

function ChevronRight({ className, size }: { className?: string; size?: number }) {
    return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
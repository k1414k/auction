import { Send, Image, Package } from 'lucide-react';

export default function TransactionPage() {
    return (
        <div className="bg-gray-50 min-h-screen pt-16">
            <div className="bg-white p-6 border-b flex justify-around relative">
                {['購入', '発送', '受取', '完了'].map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-4 h-4 rounded-full border-4 border-white ring-1 ring-gray-100 shadow-sm ${i <= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        <span className={`text-[10px] font-bold ${i <= 1 ? 'text-blue-500' : 'text-gray-400'}`}>{s}</span>
                    </div>
                ))}
                <div className="absolute top-8 left-12 right-12 h-[2px] bg-gray-100" />
            </div>

            <div className="p-4 space-y-6">
                <div className="flex flex-col items-center py-4">
                    <Package className="text-blue-500 mb-2" size={32} />
                    <p className="text-sm font-bold text-gray-800">商品の発送をお待ちください</p>
                    <p className="text-xs text-gray-400 mt-1">出品者からの発送通知をお送りします</p>
                </div>

                <div className="flex gap-3 mr-12">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 leading-relaxed">
                        ご購入ありがとうございます！本日中に発送予定です。よろしくお願いします。
                    </div>
                </div>
            </div>

            <div className="mt-5 p-4 bg-white/90 backdrop-blur-sm border-t flex gap-2">
                <button className="p-3 text-gray-400 bg-gray-100 rounded-full"><Image size={20} /></button>
                <input className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm outline-none border-none focus:ring-2 focus:ring-blue-100" placeholder="メッセージを入力" />
                <button className="bg-blue-500 text-white p-3 rounded-full shadow-lg"><Send size={20} /></button>
            </div>
        </div>
    );
}
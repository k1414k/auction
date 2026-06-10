import { Bell, ShoppingBag, Info, ChevronRight } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <div className="bg-white min-h-screen pt-16">
            <div className="px-5 py-4 flex items-end justify-between">
                <h1 className="text-2xl font-bold text-gray-800">お知らせ</h1>
            </div>

            <div className="flex px-4 border-b">
                <button className="px-4 py-3 text-sm font-bold border-b-2 border-blue-500 text-blue-500">すべて</button>
                <button className="px-4 py-3 text-sm font-bold text-gray-400">やることリスト</button>
            </div>

            <div className="divide-y divide-gray-50">
                {[
                    { icon: <ShoppingBag />, title: '発送通知', desc: '商品が発送されました', time: '2時間前', color: 'bg-blue-50 text-blue-500' },
                    { icon: <Info />, title: 'キャンペーン', desc: '最大1,000pt還元のチャンス！', time: '5時間前', color: 'bg-orange-50 text-orange-500' },
                ].map((item, i) => (
                    <div key={i} className="p-4 flex gap-4 active:bg-gray-50 items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                <span className="text-[10px] text-gray-300">{item.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.desc}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300" />
                    </div>
                ))}
            </div>
        </div>
    );
}
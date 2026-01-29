import { Star, Settings, ExternalLink } from 'lucide-react';

export default function UserProfilePage() {
    return (
        <div className="bg-gray-50 min-h-screen pt-16 pb-24">
            <div className="bg-white p-8 border-b text-center space-y-4">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full mx-auto p-1 shadow-lg shadow-blue-100">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-3xl">👤</div>
                    </div>
                </div>

                <div>
                    <h1 className="text-xl font-bold text-gray-800">モダンストア公式</h1>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-600">4.8</span>
                        <span className="text-xs text-gray-300 ml-1">(245評価)</span>
                    </div>
                </div>

                <div className="flex justify-center gap-8 py-2">
                    <div className="text-center"><p className="font-bold">120</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">出品中</p></div>
                    <div className="text-center"><p className="font-bold">1.5k</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">フォロワー</p></div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    24時間以内の発送を心がけています！お気軽にコメントください。
                </p>
            </div>

            <div className="grid grid-cols-3 gap-0.5 mt-2">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white hover:opacity-90 transition cursor-pointer border-[0.5px] border-gray-50" />
                ))}
            </div>
        </div>
    );
}
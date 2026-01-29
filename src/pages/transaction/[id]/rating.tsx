import { Smile, Frown, MessageSquare } from 'lucide-react';

export default function RatingPage() {
    return (
        <div className="bg-gray-50 min-h-screen p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">取引お疲れ様でした！</h1>
                    <p className="text-sm text-gray-400 mt-2">相手の評価をして取引を完了しましょう</p>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border-2 border-transparent focus:border-blue-500 active:bg-blue-50 transition group">
                        <Smile size={48} className="text-yellow-400 group-hover:scale-110 transition" />
                        <span className="mt-2 font-bold text-gray-600">良かった</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border-2 border-transparent focus:border-red-500 active:bg-red-50 transition group">
                        <Frown size={48} className="text-gray-300 group-hover:scale-110 transition" />
                        <span className="mt-2 font-bold text-gray-600">残念</span>
                    </button>
                </div>

                <div className="relative">
                    <textarea className="w-full bg-white rounded-2xl p-5 pt-10 text-sm shadow-sm h-40 outline-none focus:ring-2 focus:ring-blue-100 resize-none" placeholder="感謝の気持ちを伝えましょう" />
                    <MessageSquare className="absolute top-4 left-4 text-gray-300" size={20} />
                </div>

                <button className="w-full bg-blue-500 text-white font-bold py-5 rounded-full shadow-xl shadow-blue-100">
                    評価を投稿して取引を完了する
                </button>
            </div>
        </div>
    );
}
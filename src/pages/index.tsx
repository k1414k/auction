import { Clock, Flame, History, Gem, ChevronRight, ArrowUpRight } from "lucide-react";

const hero = { title: "高く売って、安く買える", subtitle: "あなたの新しいオークション", img: "/phone.png" };
// ダミーデータ：実際にはAPIから取得する想定
const endingSoonItems = [
  { id: 1, title: "Vintage Camera A12", price: 15800, timeLeft: "04:52", bids: 24, img: "/api/placeholder/200/200" },
  { id: 2, title: "Mechanical Watch Blue", price: 42000, timeLeft: "02:15", bids: 56, img: "/api/placeholder/200/200" },
  { id: 3, title: "Retro Console Set", price: 8500, timeLeft: "01:30", bids: 12, img: "/api/placeholder/200/200" },
];

const oneYenItems = [
  { id: 4, title: "iPhone 13 Pro (Junk)", currentPrice: 1200, bids: 8, img: "/api/placeholder/200/200" },
  { id: 5, title: "Designer Leather Bag", currentPrice: 501, bids: 15, img: "/api/placeholder/200/200" },
];

const soldHistory = [
  { id: 101, title: "MacBook Air M2", soldPrice: 98000, date: "3分前", img: "/api/placeholder/100/100" },
  { id: 102, title: "Wireless Earbuds", soldPrice: 12000, date: "12分前", img: "/api/placeholder/100/100" },
  { id: 103, title: "Gaming Mouse", soldPrice: 4500, date: "25分前", img: "/api/placeholder/100/100" },
];

export default function VisualPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
        <section className="mb-4">
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
          <h2 className="text-2xl font-bold">{hero.title}</h2>
          <p className="mt-2 opacity-90">{hero.subtitle}</p>
          {/* <div className="mt-4 w-full h-40 flex items-center justify-center">
            <img src={hero.img} alt="" className="h-28 object-contain" />
          </div> */}
          <div className="flex justify-end -mt-12">
            <ArrowUpRight size={150} className="text-red-400  " />
          </div>
        </div>
      </section>


      {/* 20. 落札履歴（ヒーローセクションとして活用） */}
      <section className="bg-slate-900 text-white pt-8 pb-12 px-4 shadow-md">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <History size={18} className="text-blue-400" />
          <h2 className="text-xs font-bold tracking-widest uppercase">Just Sold - 最近の落札</h2>
        </div>
        <div className="grid gap-4 pb-4">
          {soldHistory.map((item) => (
            <div key={item.id} className="min-w-[280px] bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-4 border border-white/10">
              <img src={item.img} className="w-16 h-16 rounded-xl object-cover bg-slate-700" alt="photo" />
              <div>
                <p className="text-[10px] text-blue-300 font-bold">{item.date}に落札</p>
                <h3 className="text-sm font-bold truncate w-40">{item.title}</h3>
                <p className="text-lg font-black text-white">¥{item.soldPrice.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="px-4 mt-6">
        {/* 1. 残り5分！緊急セクション */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="bg-red-500 p-1 rounded-lg animate-pulse">
                <Clock size={16} className="text-white" />
              </div>
              <h2 className="font-black text-gray-800 text-lg italic">LAST 5 MINUTES</h2>
            </div>
            <button className="text-xs font-bold text-red-500 flex items-center">
              もっと見る <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {endingSoonItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm border-2 border-red-50 relative overflow-hidden flex gap-4">
                <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] px-3 py-1 font-bold rounded-br-xl z-10">
                  残り {item.timeLeft}
                </div>
                <img src={item.img} className="w-24 h-24 rounded-xl object-cover" alt="" />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-red-600">¥{item.price.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{item.bids} 入札</span>
                  </div>
                  <button className="mt-2 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition">
                    入札に参加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 1円スタート！お宝探し */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Gem size={20} className="text-amber-500" />
            <h2 className="font-black text-gray-800 text-lg">1円スタートお宝市</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {oneYenItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <div className="relative">
                  <img src={item.img} className="w-full aspect-square object-cover" alt="" />
                  <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-lg">
                    1円開始
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-600 truncate mb-1">{item.title}</h3>
                  <p className="text-sm font-black text-gray-900">現在: ¥{item.currentPrice.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400">{item.bids}件入札中</span>
                    <div className="bg-slate-100 p-1.5 rounded-full">
                        <Flame size={12} className="text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
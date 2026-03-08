import { useEffect, useState } from "react";
import { Clock, Flame, History, Gem, ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { nextApi } from "@/lib/fetch";
import { apiAssetUrl } from "@/lib/apiAssetUrl";
import { formatNumber } from "@/utils/format-number";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

type HomeItem = {
  id: number;
  title: string;
  price: number;
  image: string | null;
  current_bid?: number | null;
  bids_count?: number;
  end_at?: string | null;
  sold_price?: number;
  updated_at?: string;
};

const hero = { title: "高く売って、安く買える", subtitle: "あなたの新しいオークション" };

function formatTimeLeft(endAt: string | null | undefined): string {
  if (!endAt) return "--:--";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "終了";
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}:${mm.toString().padStart(2, "0")}` : `${mm}分`;
}

function formatAgo(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d2 = Math.floor(h / 24);
  if (d2 > 0) return `${d2}日前`;
  if (h > 0) return `${h}時間前`;
  if (m > 0) return `${m}分前`;
  return "たった今";
}

export default function HomePage() {
  const [endingSoon, setEndingSoon] = useState<HomeItem[]>([]);
  const [oneYen, setOneYen] = useState<HomeItem[]>([]);
  const [soldHistory, setSoldHistory] = useState<HomeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [es, oy, rs] = await Promise.all([
          nextApi<unknown, HomeItem[]>("/items/ending-soon", { method: "GET" }).catch(() => []),
          nextApi<unknown, HomeItem[]>("/items/one-yen", { method: "GET" }).catch(() => []),
          nextApi<unknown, HomeItem[]>("/items/recently-sold", { method: "GET" }).catch(() => []),
        ]);
        setEndingSoon(Array.isArray(es) ? es : []);
        setOneYen(Array.isArray(oy) ? oy : []);
        setSoldHistory(Array.isArray(rs) ? rs : []);
      } catch {
        setEndingSoon([]);
        setOneYen([]);
        setSoldHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-4 pb-24">
      <section className="mb-4">
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
          <h2 className="text-2xl font-bold">{hero.title}</h2>
          <p className="mt-2 opacity-90">{hero.subtitle}</p>
          <div className="flex justify-end -mt-12">
            <ArrowUpRight size={150} className="text-red-400" />
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white pt-8 pb-12 px-4 shadow-md">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <History size={18} className="text-blue-400" />
          <h2 className="text-xs font-bold tracking-widest uppercase">Just Sold - 最近の落札</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard count={3} />
          </div>
        ) : soldHistory.length === 0 ? (
          <p className="text-sm text-slate-400">まだ落札履歴はありません</p>
        ) : (
          <div className="grid gap-4 pb-4">
            {soldHistory.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <div className="min-w-[280px] bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-4 border border-white/10 hover:bg-white/15 transition">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                    {item.image && <img src={apiAssetUrl(item.image) || ""} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-300 font-bold">{formatAgo(item.updated_at)}に落札</p>
                    <h3 className="text-sm font-bold truncate w-40">{item.title}</h3>
                    <p className="text-lg font-black text-white">¥{formatNumber(item.sold_price ?? item.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="px-4 mt-6">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="bg-red-500 p-1 rounded-lg animate-pulse">
                <Clock size={16} className="text-white" />
              </div>
              <h2 className="font-black text-gray-800 text-lg italic">LAST 5 MINUTES</h2>
            </div>
            <Link href="/search" className="text-xs font-bold text-red-500 flex items-center">
              もっと見る <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-2">
              <SkeletonCard count={4} />
            </div>
          ) : endingSoon.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">終了間近のオークションはありません</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {endingSoon.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <div className="bg-white rounded-2xl p-3 shadow-sm border-2 border-red-50 relative overflow-hidden flex gap-4 hover:shadow-md transition">
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] px-3 py-1 font-bold rounded-br-xl z-10">
                      残り {formatTimeLeft(item.end_at)}
                    </div>
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image && <img src={apiAssetUrl(item.image) || ""} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{item.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-red-600">
                          ¥{formatNumber(item.current_bid ?? item.price)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">{item.bids_count ?? 0} 入札</span>
                      </div>
                      <span className="mt-2 inline-block bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-lg active:scale-95 transition">
                        入札に参加
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Gem size={20} className="text-amber-500" />
            <h2 className="font-black text-gray-800 text-lg">1円スタートお宝市</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-2">
              <SkeletonCard count={4} />
            </div>
          ) : oneYen.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">1円スタートの商品はありません</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {oneYen.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div className="relative">
                      <div className="w-full aspect-square bg-gray-100 relative">
                        {item.image && <img src={apiAssetUrl(item.image) || ""} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-lg">
                        1円開始
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-gray-600 truncate mb-1">{item.title}</h3>
                      <p className="text-sm font-black text-gray-900">
                        現在: ¥{formatNumber(item.current_bid ?? item.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-400">{item.bids_count ?? 0}件入札中</span>
                        <div className="bg-slate-100 p-1.5 rounded-full">
                          <Flame size={12} className="text-orange-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

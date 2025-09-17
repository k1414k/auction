// app/page.tsx (Home)
"use client";
import { useState } from "react";
import { AuctionCard } from "../components/AuctionCard";
// import BottomNav from "@/components/BottomNav";

const samples = [
  { id: 1, title: "ノートパソコン", price: 29800, remain: "終了まで 2日", img: "/laptop.png", note: "現在価格より安い" },
  { id: 2, title: "スマートフォン", price: 25000, remain: "終了まで 5日", img: "/phone.png", note: "現在価格と同じ" },
  { id: 3, title: "モニター", price: 10000, remain: "終了まで 3日", img: "/monitor.png" },
  { id: 4, title: "タブレット", price: 18000, remain: "終了まで 1日", img: "/tablet.png" },
];

export default function Home() {
  const [openFilters, setOpenFilters] = useState(false);

  return (
    <div className="px-4 pt-4">
      {/* ヒーロー */}
      <section className="mb-4">
        <div className="rounded-xl overflow-hidden bg-slate-100 p-5">
          <h2 className="text-xl font-semibold">注目のオークション</h2>
          <p className="text-sm text-gray-600 mt-1">いま注目のアイテムをピックアップ</p>
        </div>
      </section>

      {/* カテゴリ横スライド */}
      <section className="mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {["PC", "スマホ", "タブレット", "周辺機器"].map((c) => (
            <button key={c} className="min-w-[86px] px-3 py-2 rounded-xl bg-white shadow-sm text-sm">
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* フィルタボタン */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">おすすめ</div>
        <button onClick={() => setOpenFilters(true)} className="text-sm px-3 py-1 rounded-lg bg-sky-600 text-white">
          フィルター
        </button>
      </div>

      {/* カードグリッド */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          {samples.map((it) => (
            <AuctionCard key={it.id} title={it.title} price={it.price} remain={it.remain} img={it.img} note={it.note} />
          ))}
        </div>
      </section>

      {/* <BottomNav open={openFilters} onClose={() => setOpenFilters(false)}>
        <h3 className="text-lg font-semibold mb-2">フィルター</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2"><input type="checkbox" /> 中古</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> 新品同様</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> ¥20,000以下</label>
        </div>
      </BottomNav> */}
    </div>
  );
}

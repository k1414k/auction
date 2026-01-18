// app/visual/page.tsx
import { AuctionCard } from "@/components/AuctionCard";

const hero = { title: "iPhone 15 Pro 特集", subtitle: "ついに登場", img: "/phone.png" };

export default function Visual() {
  return (
    <div className="px-4 pt-4">
      <section className="mb-4">
        <div className="rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
          <h2 className="text-2xl font-bold">{hero.title}</h2>
          <p className="mt-2 opacity-90">{hero.subtitle}</p>
          <div className="mt-4 w-full h-40 flex items-center justify-center">
            {/* <img src={hero.img} alt="" className="h-28 object-contain" /> */}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">ピックアップ</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/*{[1,2,3,4].map((i)=> (*/}
          {/*  <div key={i} className="min-w-[220px]">*/}
          {/*    <AuctionCard title={`アイテム ${i}`} price={15000 + i*1000} remain="残り2日" img="/laptop.png" />*/}
          {/*  </div>*/}
          {/*))}*/}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">カテゴリ別</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map((i)=> (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-28 bg-gray-100 flex items-center justify-center">カテゴリ画像</div>
              <div className="mt-2 font-semibold">カテゴリ名{i}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

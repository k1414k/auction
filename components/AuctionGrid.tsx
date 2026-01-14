// components/AuctionGrid.tsx
import { AuctionCard } from "./AuctionCard";

const samples = [
    { id: 1, title: "ノートパソコン", price: 29800, remain: "終了まで 2日", img: "/laptop.png" },
    { id: 2, title: "スマートフォン", price: 25000, remain: "終了まで 5日", img: "/phone.png" },
    { id: 3, title: "モニター", price: 10000, remain: "終了まで 3日", img: "/monitor.png" },
];

export type Filters = {
    q?: string;
    category?: string;
    tag?: string;
};// ここで filters.q は string | undefined になる
  // undefinedの場合は検索条件なしとして扱える

export function AuctionGrid({
                                filters,
                            }: {
    filters: { q?: string; category?: string; tag?: string };
}) {
    // 🔹 本来はここでDB検索
    const items = samples.filter((item) =>
        filters.q ? item.title.includes(filters.q) : true
    );

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                    {filters.q ? `「${filters.q}」の検索結果` : "商品一覧"}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {items.map((it) => (
                    <AuctionCard key={it.id} {...it} />
                ))}
            </div>
        </>
    );
}

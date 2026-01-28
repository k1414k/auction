import { AuctionCard } from "./AuctionCard";
import { Item } from "@/types/item";

type Props = {
  items: Item[];
  filters: { q?: string; category?: string };
};

export function AuctionGrid({ items, filters }: Props) {
  const label = filters.q || filters.category || "すべて";

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">「{label}」の結果</h2>
        <span className="text-sm text-gray-500">{items.length} 件</span>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-gray-400">一致する商品がありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <AuctionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
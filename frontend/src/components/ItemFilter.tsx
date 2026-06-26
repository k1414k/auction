// components/AuctionGrid.tsx
import { Item } from "@/types/item";
import { AuctionCard } from "./AuctionCard";
import { Category } from "@/types/category";
import Link from "next/link";

export type Filters = {
    q?: string;
    category?: string;
    tag?: string;
};

export function ItemFilter({
    items,
    filters,
    categories
}: {
    items: Item[];
    categories: Category[];
    filters: Filters;
}) {
    const selectedCategory = categories.find(c => c.name === filters.category);
    const resultLabel = filters.q
        ? `「${filters.q}」の検索結果`
        : selectedCategory
          ? `${selectedCategory.name}の商品`
          : "商品一覧";

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                    {resultLabel}（{items.length}件）
                </div>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-12 text-center">
                    <p className="font-bold text-gray-700">条件に合う商品がありません</p>
                    <p className="mt-1 text-sm text-gray-500">キーワードを短くするか、カテゴリを変更してみてください。</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 gap-2">
                    {items.map((item) => (
                        <Link key={item.id} href={`/items/${item.id}`}>
                            <AuctionCard item={item} />
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

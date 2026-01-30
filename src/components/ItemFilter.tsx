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
    const categoryId = selectedCategory?.id;

    const filteredItems = items.filter((item) => {
        // キーワード検索
        if (filters.q && !item.title.includes(filters.q)) return false;

        // カテゴリ (見つかったIDとitemのIDを直接比較)
        if (filters.category && item.category_id !== categoryId) return false;

        // タグ
        // if (filters.tag && !item.tags?.includes(filters.tag)) return false;

        return true;
    });

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                    {filters.q
                        ? `「${filters.q}」の検索結果（${filteredItems?.length}件）`
                        : "商品一覧"}
                </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 gap-1">
                {filteredItems?.map((item) => (
                    <Link key={item.id} href={`/items/${item.id}`}>
                        <AuctionCard item={item} />
                    </Link>
                ))}
            </div>
        </>
    );
}

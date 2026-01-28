// components/AuctionGrid.tsx
import { Item } from "@/types/item";
import { AuctionCard } from "./AuctionCard";
import { Category } from "@/types/category";
import { useEffect, useState } from "react";

export type Filters = {
    q?: string;
    category?: string;
    tag?: string;
};

export function AuctionGrid({
    items,
    filters,
    categories
}: {
    items: Item[];
    categories: Category[];
    filters: Filters;
}) {

    const [categoryId, setCategoryId] = useState(0) 
    const [filteredItems, setFilteredItems] = useState<Item[]|null>(null) 
    const findCategoryId = () => { // まずクエリから持ってきたカテゴリで該当カテゴリのidを探す
      categories.forEach(category=>{ 
        if (category.name === filters.category) setCategoryId(category.id)
      })
    }
    const findingItems = () => {
      findCategoryId()

      setFilteredItems(items.filter((item) => {
        // キーワード検索
        if (filters.q && !item.title.includes(filters.q)) return false;

        // カテゴリ
        if (filters.category && item.category_id !== categoryId) return false;

        // タグ
        // if (filters.tag && !item.tags?.includes(filters.tag)) return false;

        return true;
      }))};
    useEffect(()=>{
      findingItems();
    }, [items, categories, filters])

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                    {filters.q
                        ? `「${filters.q}」の検索結果（${filteredItems?.length}件）`
                        : "商品一覧"}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {filteredItems?.map((it) => (
                    <AuctionCard key={it.id} item={it} />
                ))}
            </div>
        </>
    );
}

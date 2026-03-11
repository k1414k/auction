import { Trash2, Clock, Tag } from "lucide-react";
import { AuctionCard } from "@/components/AuctionCard";
import Link from "next/link";
import { Item } from "@/types/item";
import { Category } from "@/types/category";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { apiAssetUrl } from "@/lib/apiAssetUrl";

type SearchTopProps = {
  categories: Category[];
  items: Item[];
};

export function SearchTop({ categories, items }: SearchTopProps) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);

  const findHistory = () => {
    setHistory(
      JSON.parse(localStorage.getItem("search_history") || "[]").slice(0, 5)
    );
  };

  const deleteHistoryItem = (q: string) => {
    const currentHistory: string[] = JSON.parse(
      localStorage.getItem("search_history") || "[]"
    );
    const newHistory = currentHistory.filter((item) => item !== q);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
    findHistory();
  };

  const pushSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    findHistory();
  }, []);

  return (
    <>
      {history.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-500">検索履歴</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((w) => (
              <div
                key={w}
                className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <button
                  className="pl-3 pr-2 py-1.5 text-sm text-gray-700 cursor-pointer"
                  onClick={() => pushSearch(w)}
                >
                  {w}
                </button>
                <button
                  onClick={() => deleteHistoryItem(w)}
                  className="pr-2.5 pl-0.5 py-1.5 text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="削除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-500">カテゴリ</h2>
        </div>
        <div className="grid grid-cols-5 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3 gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/search?category=${c.name}`)}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:ring-2 ring-blue-400 transition-all text-center group"
            >
              <div className="relative w-full h-16 bg-gray-100">
                {c.image_url ? (
                  <Image
                    src={apiAssetUrl(c.image_url)}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Tag size={28} />
                  </div>
                )}
              </div>
              <div className="py-1.5 px-1">
                <span className="text-xs font-medium text-gray-700">
                  {c.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-3">おすすめ順</h2>
        <div className="grid grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 gap-2">
          {items.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`}>
              <AuctionCard item={item} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

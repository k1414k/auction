import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {AuctionCard} from "@/components/AuctionCard";
import Link from "next/link";
import { Item } from "@/types/item";
import { Category } from "@/types/category";

type SearchTopProps = {
  categories: Category[];
  items: Item[];
};

export function SearchTop({categories, items}:SearchTopProps
) {
    const router = useRouter();

    const pushSearch = (q: string) => {
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <>
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 flex gap-2">
                    検索履歴
                </h2>
                {["PS5 本体", "MacBook Pro"].map((w) => (
                    <div className={"flex items-center"} key={w}>
                        <div
                            className="
                            hover:bg-slate-200 p-1 px-3 mt-0.5 border-b border-b-gray-300
                            cursor-pointer flex justify-between
                        "
                            onClick={() => pushSearch(w)}
                        >
                            <button
                                className="text-left"
                            >
                                》{w}
                            </button>
                        </div>
                        <Trash2 className="text-red-500 cursor-pointer"/>
                    </div>

                ))}
            </section>

            <section>
                <h2 className="text-sm font-bold text-gray-500 mb-3">カテゴリ</h2>
                <div className="grid grid-cols-2 gap-3">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => router.push(`/search?category=${c.name}`)}
                            className="bg-white p-4 rounded-xl shadow-sm"
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            </section>

            <section className="mt-5">
                <h2 className="text-sm font-bold text-gray-500 mb-3">新着順</h2>
                <div className="grid grid-cols-3 gap-4">
                    {
                        items.map(item=>(
                            <Link key={item.id} href={`/items/${item.id}`}>
                                <AuctionCard item={item} />
                            </Link>
                        ))
                    }
                </div>
            </section>

        </>
    );
}

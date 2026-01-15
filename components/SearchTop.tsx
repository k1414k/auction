import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
};

export function SearchTop({categories}: Props) {
    const router = useRouter();

    const pushSearch = (q: string) => {
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <>
            {/* 検索バー */}
            {/* <div className="mb-6">
                <div className="relative">
                    <input
                        placeholder="キーワードから探す"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") pushSearch(e.currentTarget.value);
                        }}
                        className="w-full rounded-xl py-3 pl-12 shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                </div>
            </div> */}

            {/* 急上昇 */}
            <section className="mb-6">
                <h2 className="text-sm font-bold text-gray-500 flex gap-2">
                    検索履歴
                </h2>
                {["PS5 本体", "MacBook Pro"].map((w) => (
                    <div
                        key={w}
                        className="
                            hover:bg-slate-200 p-1 mt-0.5 border-b border-b-gray-300 
                            cursor-pointer flex justify-between
                        "
                    >
                        <button
                            onClick={() => pushSearch(w)}
                            className="text-left"
                        >
                            》{w}
                        </button>
                        <Trash2 />
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
                <div className="grid grid-cols-2 gap-3">
                </div>
            </section>

        </>
    );
}

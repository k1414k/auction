import { Category } from "@/types/category";
import { useRouter } from "next/router";

type Props = {
  categories: Category[];
};

export function CategoryChips({ categories }: Props) {
  const router = useRouter();
  
  // 現在の URL クエリ（?category=... など）を取得
  const { category: currentCategory } = router.query;

  const onSelect = (categoryName?: string) => {
    const query = { ...router.query };
    if (categoryName) query.category = categoryName;
    else delete query.category;

    router.push({
      pathname: "/search",
      query,
    });
  };

  return (
    <div className="flex gap-2 overflow-x-auto mb-4">
      <button
        onClick={() => onSelect()}
        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors
          ${currentCategory == null ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-200"}
        `}
      >
        すべて
      </button>
      {categories.map((c) => {
        // 現在選択されているカテゴリかどうかを判定
        const active = currentCategory === c.name;

        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.name)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors
              ${active ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-200"}
            `}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

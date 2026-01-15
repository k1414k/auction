import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
};

export function CategoryChips({ categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const onSelect = (category: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("category", category);
    router.push(`/search?${p.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto mb-4">
      {categories.map((c) => {
        const active = params.get("category") === c.name;

        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.name)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap
              ${active ? "bg-blue-600 text-white" : "bg-white text-gray-700"}
            `}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

import { nextApi } from "@/lib/fetch";
import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function SearchHeader() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    setIsTyping(value.length > 0);
  };

  const saveSearchKeyword = () => {
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    const newHistory = [keyword, ...history.filter((k: string) => k !== keyword)].slice(0, 5);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const pushSearch = () => {
    if (keyword.length < 2) {
      alert("2文字以上で入力してください");
      return;
    }

    if (keyword.length > 10) {
      alert("10文字以下で入力してください");
      return;
    }

    setIsTyping(false);
    saveSearchKeyword();
    router.push(`/search?q=${encodeURIComponent(keyword)}`);

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  useEffect(() => {
    const getItems = async () => {
      try {
        type ResType = { data: Item[] };
        const res: ResType = await nextApi("/items", { method: "GET" });
        setItems(res.data);
      } catch (e) {
        if (e instanceof Error) {
          const errorMessage = JSON.parse(e.message);
          console.log(errorMessage);
        } else {
          alert("ERR_CODE_500");
        }
      }
    };

    getItems();
  }, []);

  useEffect(() => {
    setIsTyping(false);
  }, [router.asPath]);

  const SuggestList = ({
    items,
    keyword,
  }: {
    items: Item[];
    keyword: string;
  }) => {
    const filtered = items
      .filter((item: Item) => {
        const title = item.title?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        const query = keyword.toLowerCase();

        return title.includes(query) || description.includes(query);
      })
      .slice(0, 7);

    if (filtered.length === 0) {
      return (
        <div className="px-3 py-3 text-sm text-gray-500">
          該当する候補がありません
        </div>
      );
    }

    return (
      <ul>
        {filtered.map((item: Item) => (
          <li
            key={item.id}
            className="border-b border-gray-100 last:border-0 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            onMouseDown={() => {
              setIsTyping(false);
              setKeyword(item.title);
              router.push(`/search?q=${encodeURIComponent(item.title)}`);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            <span className="font-medium truncate pr-2">{item.title}</span>
            <span className="text-gray-500 shrink-0">
              ¥{formatNumber(item.price)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative w-full min-w-0">
      <div className="relative">
        <input
          placeholder="何をお探しですか？"
          value={keyword}
          onChange={handleChange}
          onFocus={() => {
            setIsTyping(keyword.length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushSearch();
          }}
          className="w-full bg-gray-100 px-3 py-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <Search
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer hover:text-sky-600"
          onClick={pushSearch}
        />
      </div>

      {isTyping && items && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <SuggestList items={items} keyword={keyword} />
        </div>
      )}
    </div>
  );
}
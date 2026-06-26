import { nextApi } from "@/lib/fetch";
import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function normalizeKeyword(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function SearchHeader() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    setIsTyping(value.trim().length > 0);
  };

  const saveSearchKeyword = (value: string) => {
    const history: string[] = JSON.parse(localStorage.getItem("search_history") || "[]");
    const normalized = normalizeKeyword(value);
    const newHistory = [
      normalized,
      ...history.filter((entry) => normalizeKeyword(entry).toLowerCase() !== normalized.toLowerCase()),
    ].slice(0, 5);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const pushSearch = (value = keyword) => {
    const normalized = normalizeKeyword(value);

    if (normalized.length < 2) {
      alert("2文字以上で入力してください");
      return;
    }

    if (normalized.length > 50) {
      alert("50文字以下で入力してください");
      return;
    }

    setKeyword(normalized);
    setIsTyping(false);
    saveSearchKeyword(normalized);
    router.push({ pathname: "/search", query: { q: normalized } });
  };

  useEffect(() => {
    const normalized = normalizeKeyword(keyword);
    if (!isTyping || normalized.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        type ResType = { data: Item[] };
        const params = new URLSearchParams({ q: normalized, limit: "7" });
        const res: ResType = await nextApi(`/items?${params.toString()}`, { method: "GET" });
        if (!cancelled) setSuggestions(res.data);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isTyping, keyword]);

  useEffect(() => {
    setIsTyping(false);
    const query = typeof router.query.q === "string" ? router.query.q : "";
    setKeyword(query);
  }, [router.asPath, router.query.q]);

  const SuggestList = ({ items }: { items: Item[] }) => {
    if (suggestionsLoading) {
      return <div className="px-3 py-3 text-sm text-gray-500">候補を検索しています...</div>;
    }

    if (items.length === 0) {
      return (
        <div className="px-3 py-3 text-sm text-gray-500">
          該当する候補がありません
        </div>
      );
    }

    return (
      <ul>
        {items.map((item: Item) => (
          <li
            key={item.id}
            className="border-b border-gray-100 last:border-0 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            onMouseDown={() => {
              pushSearch(item.title);
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
          className="w-full bg-gray-100 px-3 pr-10 py-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button
          type="button"
          aria-label="検索する"
          onClick={() => pushSearch()}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-transparent p-1 text-gray-400 hover:bg-white hover:text-sky-600 active:bg-sky-50 transition"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {isTyping && normalizeKeyword(keyword).length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <SuggestList items={suggestions} />
        </div>
      )}
    </div>
  );
}

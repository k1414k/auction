import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export function SearchHeader() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")

  const pushSearch = () => {
      router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // useEffect(()=>{
  //   console.log(keyword);
    
  // }, [keyword])

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="text-xl font-bold cursor-default text-slate-800">Auction</div>
        <div className="flex-1 relative">
          <input
            placeholder="検索（例：MacBook）何をお探しですか？"
            onChange={(e)=>{
              setKeyword(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") pushSearch();
              // if (e.key === "Enter") pushSearch(e.currentTarget.value);
            }}
            className="w-full bg-gray-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <Search className="absolute top-[15%] right-2 text-gray-300 w-5
            cursor-pointer hover:text-sky-600
          " />
        </div>
      </div>
    </header>
  );
}

import { useSearchStore } from "@/stores/searchStore";
import { Search, X } from "lucide-react";
import { useRouter } from "next/router";

export function SearchHeader() {
  const router = useRouter()
  const search = useSearchStore()
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    search.setKeyword(val); // ストアを更新
    if (val.length > 0) search.setIsTyping(true);
    else search.setIsTyping(false);

    // 他のページで入力し始めたら、検索ページへ飛ばす
    if (router.pathname !== "/search" && val.length > 0) {
       router.push(`/search`);
    }
  };

  // const handleClear = () => {
  //   setKeyword("");
  // };

  const pushSearch = () => {
    if (search.keyword.length < 2){
      alert("2文字以上で入力してください")
      return;
    }
    if (search.keyword.length > 8){
      alert("8文字以下で入力してください")
      return;
    }
    // saveSearchKeyword();
    search.setIsTyping(false);
    router.push(`/search?q=${encodeURIComponent(search.keyword)}`);
  };

  // 検索時に保存する関数
  // const saveSearchKeyword = () => {
  //   const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    
  //   // 重複削除して先頭に追加（最新5件まで）
  //   const newHistory = [keyword, ...history.filter((k :string) => k !== keyword)];
    
  //   localStorage.setItem('search_history', JSON.stringify(newHistory));
  // };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b px-20 sm:px-0 ">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="text-xl font-bold cursor-default text-slate-800">Auction</div>
        <div className="flex-1 relative">
          <input
            placeholder="検索（例：MacBook）何をお探しですか？"
            onChange={handleChange}
            onFocus={()=>{ //入力中判別ロジック <-handleChangeの中でもある
              if (search.keyword.length > 0) search.setIsTyping(true);
              else search.setIsTyping(false);
            }}
            onKeyDown={e=>{
              if (e.key === "Enter") pushSearch()
            }}
            // onBlur={()=>search.setIsTyping(false)}
            className="ml-6 sm:ml-0 w-full bg-gray-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <Search className="absolute top-[15%] -right-2 sm:right-2 text-gray-300 w-5
            cursor-pointer hover:text-sky-600" 
            // onClick={()=>(pushSearch())} 
          />

{/*           
          {keyword && (
          <button 
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X size={18} />
          </button>
        )} */}

        
        </div>
      </div>
    </header>
  );
}

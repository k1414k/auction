import { nextApi } from "@/lib/fetch";
import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";
import { Search, X } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export function SearchHeader() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const clearKeyword = () => {
    setKeyword("");
    setIsTyping(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    if (e.target.value.length > 0) setIsTyping(true);
    else setIsTyping(false);
  };

  const pushSearch = () => {
    if (keyword.length < 2){
      alert("2文字以上で入力してください")
      return;
    }
    if (keyword.length > 8){
      alert("8文字以下で入力してください")
      return;
    }
    setIsTyping(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
    
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };
    const [items,setItems] = useState<Item|null>()
    useEffect(()=>{

          const getItems = async() => {
              try {
                  type ResType = {data:Item}
                  const res:ResType = await nextApi("/items", {method:"GET"})
                  console.log(res.data)
      
                  setItems(res.data)
              }
              catch (e){
                  if (e instanceof Error){
                      const errorMessage= JSON.parse(e.message)
                      console.log(errorMessage)
                  }
                  else {
                      alert("ERR_CODE_500")
                  }
              }
          }

          getItems()
    }, [])

    useEffect(()=>{
      setIsTyping(false)
    }, [router.asPath])

  // 検索時に保存する関数
  // const saveSearchKeyword = () => {
  //   const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    
  //   // 重複削除して先頭に追加（最新5件まで）
  //   const newHistory = [keyword, ...history.filter((k :string) => k !== keyword)];
    
  //   localStorage.setItem('search_history', JSON.stringify(newHistory));
  // };

  const SuggestList = ({ items, keyword }: {
        items: Item[],
        keyword: string
    }) => { // ここでフィルタリング（タイトル or 説明文）
        if (!items) return
        const filtered = items.filter((item: Item) => 
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.description?.toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 7);

        return (
            <ul className="-mb-3 z-10">
                {filtered.map((item: Item) => (
                    <li key={item.id} className="border-b p-2 md:text-sm sm:text-xs hover:bg-gray-50 cursor-pointer" onMouseDown={() => {
                        setIsTyping(false);
                        setKeyword(item.title)
                        router.push(`/search?q=${item.title}`);
                        document.body.scrollTop = 0;
                        document.documentElement.scrollTop = 0;
                    }}>
                        <span className="font-bold">{item.title}</span>
                        <span className="text-xs text-gray-400 ml-2">¥{item? formatNumber(item.price) : 0}</span>
                    </li>
                ))}
            </ul>
        );
    };

  return (
    <div className="relative flex-1">
        <div className="relative">
          <input
            placeholder="何をお探しですか？"
            value={keyword}
            onChange={handleChange}
            onFocus={()=>{ //入力中判別ロジック <-handleChangeの中でもある
              if (keyword.length > 0) setIsTyping(true);
              else setIsTyping(false);
            }}
            onKeyDown={e=>{
              if (e.key === "Enter") pushSearch()
            }}
            // onBlur={()=>search.setIsTyping(false)}
            className="sm:ml-0 w-full bg-gray-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <Search className="absolute top-[15%] right-2 sm:right-2 text-gray-300 w-5
            cursor-pointer hover:text-sky-600" 
            // onClick={()=>(pushSearch())} 
          />
          {keyword.length > 0 && (
            <button 
              onClick={clearKeyword}
              className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400"
            >
              clear
            </button>
          )}
        </div>

        <div>
          {isTyping && items && (
                <div>
                    <SuggestList 
                        items={items} 
                        keyword={keyword} 
                    />
                </div>
            )}
        </div>
    </div>
  );
}



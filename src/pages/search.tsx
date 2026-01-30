import { useRouter } from "next/router";
import { ItemFilter } from "@/components/ItemFilter";
import { SearchTop } from "@/components/SearchTop";
import { CategoryChips } from "@/components/CategoryChips";
import { nextApi } from "@/lib/fetch";
import { useEffect, useState } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";

export default function SearchPage() {
    const router = useRouter()
    const { q, category, tag } = router.query
    const [categories, setCategories] = useState([])
    const [items, setItems] = useState([])
    const search = useSearchStore()

    // サジェストコンポーネント
    const SuggestList = ({ items, keyword }: {
        items: Item[],
        keyword: string
    }) => { // ここでフィルタリング（タイトル or 説明文）
        const filtered = items.filter((item: Item) => 
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.description?.toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 8);

        return (
            <ul className="bg-white mb-5 -mt-8 z-10">
                {filtered.map((item: Item) => (
                    <li key={item.id} className="border-b px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => {
                        console.log(1);
                        
                        router.push(`/items/${item.id}`);
                    }}>
                        <span className="font-bold">{item.title}</span>
                        <span className="text-xs text-gray-400 ml-2">¥{item? formatNumber(item.price) : 0}</span>
                    </li>
                ))}
            </ul>
        );
    };
    
    const getCategories = async() => {
        try {
            type ResType = {data:[]}
            const res:ResType = await nextApi("/categories", {method:"GET"})
            setCategories(res.data)
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
    const getItems = async() => {
        try {
            type ResType = {data:[]}
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
    useEffect(()=>{
        getCategories()
        getItems()
    }    
    ,[])
    useEffect(() => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, [search.keyword, search.isTyping]);

    // URLのqueryから検索条件を判定
    const hasFilter =
        typeof q === "string" ||
        typeof category === "string" ||
        typeof tag === "string"

    // AuctionGrid 用の安全な filters
    const filters = {
        q: typeof q === "string" ? q : undefined,
        category: typeof category === "string" ? category : undefined,
        tag: typeof tag === "string" ? tag : undefined,
    }

    return (
        <div className="px-4 pt-4 pb-28">
            {/* 入力がある時： サジェスト（絞り込み結果）を表示 */}
            {search.isTyping && (
                <div className="bg-white">
                    <SuggestList 
                        items={items} 
                        keyword={search.keyword} 
                    />
                </div>
            )}
            <div onClick={()=>search.setIsTyping(false)}>
            {
                !hasFilter ? //クエリの有無で異なるコンポーネント
                    <SearchTop categories={categories} items={items}/> :
                    <>
                        <CategoryChips categories={categories}/>
                        <ItemFilter items={items} filters={filters} categories={categories} />
                    </>
            }
            </div>
        </div>
    )
}


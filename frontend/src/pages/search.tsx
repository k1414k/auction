import { useRouter } from "next/router";
import { ItemFilter } from "@/components/ItemFilter";
import { SearchTop } from "@/components/SearchTop";
import { CategoryChips } from "@/components/CategoryChips";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { nextApi } from "@/lib/fetch";
import { useEffect, useState } from "react";

export default function SearchPage() {
    const router = useRouter()
    const { q, category, tag } = router.query
    const [categories, setCategories] = useState([])
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
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
        setLoading(true)
        Promise.all([getCategories(), getItems()]).finally(() => setLoading(false))
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }    
    ,[])

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
            <div>
                {loading ? (
                    <div className="grid grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 gap-2">
                        <SkeletonCard count={8} />
                    </div>
                ) : !hasFilter ? (
                    <SearchTop categories={categories} items={items}/>
                ) : (
                    <>
                        <CategoryChips categories={categories}/>
                        <ItemFilter items={items} filters={filters} categories={categories} />
                    </>
                )}
            </div>
        </div>
    )
}


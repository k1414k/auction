import { useRouter } from "next/router";
import { ItemFilter } from "@/components/ItemFilter";
import { SearchTop } from "@/components/SearchTop";
import { CategoryChips } from "@/components/CategoryChips";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { nextApi } from "@/lib/fetch";
import { Category } from "@/types/category";
import { Item } from "@/types/item";
import { useCallback, useEffect, useState } from "react";

export default function SearchPage() {
    const router = useRouter()
    const q = typeof router.query.q === "string" ? router.query.q : ""
    const category = typeof router.query.category === "string" ? router.query.category : ""
    const [categories, setCategories] = useState<Category[]>([])
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getCategories = async() => {
        try {
            type ResType = {data: Category[]}
            const res:ResType = await nextApi("/categories", {method:"GET"})
            setCategories(res.data)
        }
        catch {
            setCategories([])
        }
    }

    const getItems = useCallback(async(query: string, categoryName: string) => {
        const searchParams = new URLSearchParams()
        if (query) searchParams.set("q", query)
        if (categoryName) searchParams.set("category", categoryName)
        searchParams.set("limit", query || categoryName ? "100" : "40")

        try {
            type ResType = {data: Item[]}
            const res:ResType = await nextApi(`/items?${searchParams.toString()}`, {method:"GET"})
            setItems(res.data)
            setError(null)
        }
        catch {
            setItems([])
            setError("商品を取得できませんでした")
        }
    }, [])

    useEffect(()=>{
        getCategories()
    }, [])

    useEffect(() => {
        if (!router.isReady) return

        setLoading(true)
        getItems(q.trim(), category).finally(() => setLoading(false))
    }, [router.isReady, q, category, getItems])

    const hasFilter = q.trim().length > 0 || category.length > 0

    const filters = {
        q: q || undefined,
        category: category || undefined,
    }

    return (
        <div className="px-4 pt-4 pb-28">
            <div>
                {loading ? (
                    <div className="grid grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 gap-2">
                        <SkeletonCard count={8} />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-100 bg-white px-4 py-12 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setLoading(true)
                                getItems(q.trim(), category).finally(() => setLoading(false))
                            }}
                            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                        >
                            再試行
                        </button>
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


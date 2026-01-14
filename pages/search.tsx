// pages/search.tsx
import { useRouter } from "next/router";
import { AuctionGrid, Filters } from "@/components/AuctionGrid";
import { SearchTop } from "@/components/SearchTop";
import { CategoryChips } from "@/components/CategoryChips";

export default function SearchPage() {
    const router = useRouter();
    const { q, category, tag } = router.query;

    // URLのqueryから検索条件を判定
    const hasFilter =
        typeof q === "string" ||
        typeof category === "string" ||
        typeof tag === "string";

    // AuctionGrid 用の安全な filters
    const filters: Filters = {
        q: typeof q === "string" ? q : undefined,
        category: typeof category === "string" ? category : undefined,
        tag: typeof tag === "string" ? tag : undefined,
    };

    return (
        <div className="px-4 pt-4 pb-28">
            {!hasFilter && <SearchTop />}

            {hasFilter && (
                <>
                    <CategoryChips />
                    <AuctionGrid filters={filters} />
                </>
            )}
        </div>
    );
}

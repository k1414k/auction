import { nextApi } from "@/lib/fetch";
import { apiAssetUrl } from "@/lib/apiAssetUrl";
import { formatNumber } from "@/utils/format-number";
import { AuctionCard } from "@/components/AuctionCard";
import { Spinner } from "@/components/ui/Spinner";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Item } from "@/types/item";

type ShopData = {
  user: { id: number; nickname: string; avatar_url: string | null };
  items: Array<{
    id: number;
    title: string;
    price: number;
    trading_status: string;
    image: string | null;
    created_at: string;
  }>;
};

export default function UserShopPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShop = useCallback(async () => {
    if (typeof id !== "string") return;
    try {
      const res = await nextApi<unknown, ShopData>(`/users/${id}/items`, { method: "GET" });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">ショップが見つかりません</p>
      </div>
    );
  }

  const itemsForCard: Item[] = data.items.map((i) => ({
    id: i.id,
    user_id: 0,
    category_id: 0,
    title: i.title,
    description: "",
    price: i.price,
    trading_status: "selling",
    condition: "",
    images: [],
    image: i.image || "",
    is_favorited: false,
    user_nickname: data.user.nickname,
    created_by_current_user: false,
    created_at: i.created_at,
    updated_at: "",
  }));

  return (
    <div className="bg-gray-50 min-h-screen pt-16 pb-24">
      <div className="bg-white p-8 border-b text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-gray-200">
            {data.user.avatar_url ? (
              <Image
                src={apiAssetUrl(data.user.avatar_url) || ""}
                alt={data.user.nickname}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">👤</div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-800">{data.user.nickname}</h1>
        </div>

        <div className="flex justify-center gap-8 py-2">
          <div className="text-center">
            <p className="font-bold">{data.items.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">出品中</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
          <Package size={16} />
          出品商品
        </h2>
        {data.items.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">
            出品中の商品はありません
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-3 gap-4">
            {itemsForCard.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <AuctionCard item={item} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

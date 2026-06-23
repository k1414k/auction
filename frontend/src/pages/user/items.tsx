import { nextApi } from "@/lib/fetch";
import { apiAssetUrl } from "@/lib/apiAssetUrl";
import { formatNumber } from "@/utils/format-number";
import { Spinner } from "@/components/ui/Spinner";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type MyItem = {
  id: number;
  title: string;
  price: number;
  trading_status: string;
  image: string | null;
  category_name: string | null;
  created_at: string;
};

type ReceivedOffer = {
  id: number;
  amount: number;
  status: "pending" | "accepted" | "rejected" | string;
  created_at: string;
  buyer: { id: number; nickname: string };
  item: {
    id: number;
    title: string;
    price: number;
    trading_status: string;
    image: string | null;
  };
  order_id: number | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  listed: "出品中",
  trading: "取引中",
  sold: "売却済み",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-200 text-gray-700",
  listed: "bg-green-100 text-green-700",
  trading: "bg-blue-100 text-blue-700",
  sold: "bg-amber-100 text-amber-700",
};

export default function MyItemsPage() {
  const [items, setItems] = useState<MyItem[]>([]);
  const [offers, setOffers] = useState<ReceivedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingOfferId, setUpdatingOfferId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const [data, offerData] = await Promise.all([
        nextApi<unknown, MyItem[]>("/user/items", { method: "GET" }),
        nextApi<unknown, ReceivedOffer[]>("/offers", { method: "GET" }).catch(() => []),
      ]);
      setItems(Array.isArray(data) ? data : []);
      setOffers(Array.isArray(offerData) ? offerData : []);
    } catch {
      setItems([]);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (item: MyItem) => {
    if (!confirm(`「${item.title}」を削除しますか？`)) return;
    setDeletingId(item.id);
    try {
      await nextApi(`/items/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          alert(parsed?.error ?? "削除に失敗しました");
        } catch {
          alert("削除に失敗しました");
        }
      }
    } finally {
      setDeletingId(null);
    }
  };

  const updateOffer = async (offer: ReceivedOffer, status: "accepted" | "rejected") => {
    setUpdatingOfferId(offer.id);
    try {
      const updated = await nextApi<{ status: string }, { id: number; status: string; order_id?: number }>(`/offers/${offer.id}`, {
        method: "PATCH",
        body: { status },
      });
      setOffers((prev) => prev.map((item) => (
        item.id === offer.id
          ? { ...item, status: updated.status, order_id: updated.order_id ?? item.order_id }
          : item
      )));
      await fetchItems();
    } catch (e) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          alert(parsed?.error ?? "オファーの更新に失敗しました");
        } catch {
          alert("オファーの更新に失敗しました");
        }
      }
    } finally {
      setUpdatingOfferId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="h-14 bg-white flex items-center px-4 border-b sticky top-0 z-10">
        <Link href="/user/profile" className="text-gray-600">戻る</Link>
        <h1 className="flex-1 text-center font-bold text-gray-800 mr-8">商品管理</h1>
      </header>

      <main className="p-4 max-w-xl mx-auto">
        <Link
          href="/sell"
          className="mb-6 flex items-center justify-center gap-2 w-full py-3 bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition"
        >
          <Plus size={20} />
          新規出品
        </Link>

        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">受信オファー</h2>
          {offers.length === 0 ? (
            <div className="bg-white p-5 rounded-2xl shadow-sm text-sm text-gray-500 text-center">
              受信中のオファーはありません
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {offer.item.image && (
                        <Image src={apiAssetUrl(offer.item.image) || ""} alt={offer.item.title} fill className="object-cover" unoptimized />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{offer.item.title}</p>
                      <p className="text-sm text-gray-600">¥{formatNumber(offer.amount)} / {offer.buyer.nickname}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${offerStatusColor(offer.status)}`}>
                        {offerStatusLabel(offer.status)}
                      </span>
                    </div>
                  </div>
                  {offer.status === "pending" ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateOffer(offer, "accepted")}
                        disabled={updatingOfferId === offer.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-50"
                      >
                        <Check size={16} />
                        承認
                      </button>
                      <button
                        type="button"
                        onClick={() => updateOffer(offer, "rejected")}
                        disabled={updatingOfferId === offer.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold disabled:opacity-50"
                      >
                        <X size={16} />
                        拒否
                      </button>
                    </div>
                  ) : offer.order_id ? (
                    <Link href={`/transaction/${offer.order_id}`} className="mt-3 block text-center text-blue-600 font-bold text-sm">
                      取引を見る
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">
            <p className="mb-4">出品中の商品はありません</p>
            <Link href="/sell" className="text-blue-600 font-medium hover:underline">
              商品を出品する
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <Link href={`/items/${item.id}`} className="block">
                  <div className="flex gap-4 p-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.image ? (
                        <Image
                          src={apiAssetUrl(item.image) || ""}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.title}</p>
                      <p className="text-lg font-bold text-gray-900">¥{formatNumber(item.price)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[item.trading_status] ?? "bg-gray-100"}`}>
                        {STATUS_LABEL[item.trading_status] ?? item.trading_status}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex border-t border-gray-100">
                  <Link
                    href={`/items/${item.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-3 text-blue-600 font-medium hover:bg-blue-50 transition"
                  >
                    <Edit2 size={16} />
                    詳細
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="flex-1 flex items-center justify-center gap-1 py-3 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deletingId === item.id ? "削除中..." : "削除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function offerStatusLabel(status: string) {
  return {
    pending: "確認待ち",
    accepted: "承認済み",
    rejected: "拒否済み",
  }[status] ?? status;
}

function offerStatusColor(status: string) {
  return {
    pending: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-gray-100 text-gray-600",
  }[status] ?? "bg-gray-100 text-gray-600";
}

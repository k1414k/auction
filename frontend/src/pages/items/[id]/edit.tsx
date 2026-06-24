import { nextApi } from "@/lib/fetch";
import { apiAssetUrl } from "@/lib/apiAssetUrl";
import { SelectRow } from "@/components/SelectRow";
import { SkeletonDetail } from "@/components/ui/SkeletonDetail";
import { formatNumber } from "@/utils/format-number";
import type { Item } from "@/types/item";
import { ArrowLeft, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type FormState = {
  title: string;
  description: string;
  category_id: number | "";
  price: number;
  condition: number | "";
  sale_type: number;
  start_price: number;
  end_at: string;
  min_increment: number;
};

const CONDITION_OPTIONS = [
  { id: 0, name: "新品、未使用" },
  { id: 1, name: "未使用に近い" },
  { id: 2, name: "目立った傷や汚れなし" },
  { id: 3, name: "傷や汚れあり" },
];

const SALE_TYPE_OPTIONS = [
  { id: 0, name: "固定価格" },
  { id: 1, name: "オークション" },
  { id: 2, name: "値段交渉" },
];

const CONDITION_BY_ID = ["like_new", "good", "used", "fair"] as const;
const SALE_TYPE_BY_ID = ["fixed_price", "auction", "negotiation"] as const;

const CONDITION_ID_BY_KEY: Record<string, number> = {
  like_new: 0,
  good: 1,
  used: 2,
  fair: 3,
};

const SALE_TYPE_ID_BY_KEY: Record<string, number> = {
  fixed_price: 0,
  auction: 1,
  negotiation: 2,
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category_id: "",
  price: 0,
  condition: "",
  sale_type: 0,
  start_price: 0,
  end_at: "",
  min_increment: 100,
};

export default function ItemEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (typeof id !== "string") return;

    setLoading(true);
    setError(null);
    try {
      const [itemRes, categoryRes] = await Promise.all([
        nextApi<unknown, { data: Item }>(`/items/${id}`, { method: "GET" }),
        nextApi<unknown, { data: Category[] }>("/categories", { method: "GET" }),
      ]);
      const loadedItem = itemRes.data;
      setItem(loadedItem);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
      setForm(formFromItem(loadedItem));
    } catch {
      setError("商品情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const editable = useMemo(() => {
    return item?.created_by_current_user && ["draft", "listed"].includes(item.trading_status);
  }, [item]);

  const validate = () => {
    if (!form.title.trim() || form.title.trim().length < 2) return "商品名は2文字以上で入力してください";
    if (!form.description.trim() || form.description.trim().length < 2) return "商品の説明は2文字以上で入力してください";
    if (!form.category_id) return "カテゴリを選択してください";
    if (form.condition === "") return "商品の状態を選択してください";
    if (form.sale_type === 1) {
      if (form.start_price <= 0) return "開始価格を入力してください";
      if (!form.end_at) return "オークション終了日時を入力してください";
    } else if (form.price <= 0) {
      return "販売価格を入力してください";
    }
    return null;
  };

  const handleSave = async () => {
    if (typeof id !== "string" || !editable || saving) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saleType = SALE_TYPE_BY_ID[form.sale_type] ?? "fixed_price";
      const price = saleType === "auction" ? form.start_price : form.price;
      await nextApi(`/items/${id}`, {
        method: "PATCH",
        body: {
          item: {
            title: form.title.trim(),
            description: form.description.trim(),
            category_id: form.category_id,
            price,
            condition: CONDITION_BY_ID[Number(form.condition)] ?? "like_new",
            sale_type: saleType,
            start_price: saleType === "auction" ? form.start_price : null,
            end_at: saleType === "auction" ? form.end_at : null,
            min_increment: saleType === "auction" ? form.min_increment : null,
          },
        },
      });
      router.replace(`/items/${id}`);
    } catch (e) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          setError(parsed?.error ?? "商品の更新に失敗しました");
        } catch {
          setError("商品の更新に失敗しました");
        }
      } else {
        setError("商品の更新に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen pb-24">
        <SkeletonDetail />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 text-center text-gray-600">
          <p className="mb-4">{error}</p>
          <Link href="/user/items" className="text-blue-600 font-bold">
            商品管理へ戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="h-14 bg-white flex items-center px-4 border-b sticky top-0 z-10">
        <Link href="/user/items" className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="flex-1 text-center font-bold text-gray-800 mr-8">商品編集</h1>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-5">
        {!item.created_by_current_user && (
          <div className="bg-red-50 text-red-700 rounded-2xl p-4 text-sm">
            自分の商品だけ編集できます。
          </div>
        )}
        {item.created_by_current_user && !editable && (
          <div className="bg-amber-50 text-amber-700 rounded-2xl p-4 text-sm">
            取引中または売却済みの商品は編集できません。
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">現在の画像</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(item.images?.length ? item.images : item.image ? [item.image] : []).map((url) => (
              <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <Image src={apiAssetUrl(url)} alt={item.title} fill className="object-cover" unoptimized />
              </div>
            ))}
            {!item.images?.length && !item.image && (
              <div className="w-24 h-24 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center text-xs">
                画像なし
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">商品名</label>
            <input
              type="text"
              value={form.title}
              disabled={!editable}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full text-lg font-bold border-b border-gray-200 py-2 focus:border-blue-500 outline-none disabled:bg-transparent disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">商品の説明</label>
            <textarea
              value={form.description}
              disabled={!editable}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-sm text-gray-700 h-32 resize-none outline-none border border-gray-100 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </section>

        <fieldset disabled={!editable} className="space-y-4 disabled:opacity-70">
          <SelectRow
            label="カテゴリ"
            value={form.category_id}
            options={categories}
            onChange={(value) => setForm({ ...form, category_id: value })}
          />
          <SelectRow
            label="商品の状態"
            value={form.condition}
            options={CONDITION_OPTIONS}
            onChange={(value) => setForm({ ...form, condition: value })}
          />
          <SelectRow
            label="販売タイプ"
            value={form.sale_type}
            options={SALE_TYPE_OPTIONS}
            onChange={(value) => setForm({ ...form, sale_type: value })}
          />
        </fieldset>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="font-bold text-gray-700">
              {form.sale_type === 1 ? "開始価格" : "販売価格"}
            </label>
            <div className="flex items-center gap-2 border-b-2 border-transparent focus-within:border-blue-500 pb-1 transition">
              <span className="text-gray-400 text-xl font-bold">¥</span>
              <input
                type="text"
                inputMode="numeric"
                value={(form.sale_type === 1 ? form.start_price : form.price) || ""}
                disabled={!editable}
                onChange={(e) => {
                  const value = numericValue(e.target.value);
                  setForm(form.sale_type === 1 ? { ...form, start_price: value } : { ...form, price: value });
                }}
                className="w-32 text-right text-2xl font-bold text-gray-800 outline-none placeholder-gray-200 disabled:bg-transparent disabled:text-gray-500"
                placeholder="0"
              />
            </div>
          </div>

          {form.sale_type === 1 && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">オークション終了日時</label>
                <input
                  type="datetime-local"
                  value={form.end_at}
                  disabled={!editable}
                  onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">最低入札単位（円）</label>
                <input
                  type="number"
                  min={100}
                  value={form.min_increment}
                  disabled={!editable}
                  onChange={(e) => setForm({ ...form, min_increment: parseInt(e.target.value, 10) || 100 })}
                  className="w-full p-3 border border-gray-200 rounded-xl disabled:bg-gray-50"
                />
              </div>
              {item.bids_count ? (
                <p className="text-xs text-amber-600">
                  現在{formatNumber(item.bids_count)}件の入札があります。価格変更は慎重に行ってください。
                </p>
              ) : null}
            </>
          )}
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={!editable || saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100"
        >
          <Save size={18} />
          {saving ? "保存中..." : "変更を保存"}
        </button>
      </main>
    </div>
  );
}

function formFromItem(item: Item): FormState {
  const saleType = SALE_TYPE_ID_BY_KEY[item.sale_type ?? "fixed_price"] ?? 0;
  const condition = CONDITION_ID_BY_KEY[item.condition] ?? 0;
  const price = item.price ?? 0;
  return {
    title: item.title ?? "",
    description: item.description ?? "",
    category_id: item.category_id ?? "",
    price,
    condition,
    sale_type: saleType,
    start_price: item.start_price ?? price,
    end_at: toDatetimeLocal(item.end_at),
    min_increment: item.min_increment ?? 100,
  };
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function numericValue(value: string) {
  const sanitized = value
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, "");
  return Number(sanitized);
}

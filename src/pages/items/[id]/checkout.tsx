import { nextApi } from "@/lib/fetch";
import { Address } from "@/types/address";
import { Item } from "@/types/item";
import { formatNumber } from "@/utils/format-number";
import { ChevronLeft, ChevronRight, CreditCard, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { useUserStore } from "@/stores/userStore";

type AddressModalStatus = "select" | "create" | "edit";

const emptyForm = {
  title: "",
  name: "",
  phone_number: "",
  postal_code: "",
  address: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useUserStore((state) => state.user);
  const [item, setItem] = useState<Item | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressModalStatus, setAddressModalStatus] = useState<AddressModalStatus>("select");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("ポイント");

  const fetchAddresses = useCallback(async () => {
    try {
      const list = await nextApi<unknown, Address[]>(`/addresses`, { method: "GET" });
      setAddresses(Array.isArray(list) ? list : []);
    } catch {
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const getItem = async () => {
      try {
        type ResType = { data: Item };
        const res: ResType = await nextApi(`/items/${id}`, { method: "GET" });
        setItem(res.data);
      } catch (e) {
        if (e instanceof Error) {
          try {
            const errorMessage = JSON.parse(e.message);
            console.log(errorMessage);
          } catch {
            alert("ERR_CODE_500");
          }
        } else {
          alert("ERR_CODE_500");
        }
      }
    };
    getItem();
  }, [id]);

  const openAddressModal = useCallback(() => {
    setAddressModalStatus("select");
    setAddressError(null);
    fetchAddresses();
    setIsAddressModalOpen(true);
  }, [fetchAddresses]);

  const handleSelectAddress = (addr: Address) => setSelectedAddress(addr);
  const handleConfirmAddress = () => setIsAddressModalOpen(false);
  const handleStartCreate = () => {
    setEditingAddress(null);
    setForm(emptyForm);
    setAddressError(null);
    setAddressModalStatus("create");
  };
  const handleStartEdit = (addr: Address) => {
    setEditingAddress(addr);
    setForm({
      title: addr.title,
      name: addr.name,
      phone_number: addr.phone_number,
      postal_code: addr.postal_code,
      address: addr.address,
    });
    setAddressError(null);
    setAddressModalStatus("edit");
  };
  const backToSelect = () => setAddressModalStatus("select");

  const saveAddress = async () => {
    setAddressError(null);
    const payload = {
      title: form.title.trim(),
      name: form.name.trim(),
      phone_number: form.phone_number.replace(/\D/g, "").slice(0, 11),
      postal_code: form.postal_code.replace(/\D/g, "").replace(/^(\d{3})(\d{4})$/, "$1-$2").slice(0, 8),
      address: form.address.trim(),
    };
    try {
      if (editingAddress) {
        await nextApi(`/addresses/${editingAddress.id}`, { method: "PATCH", body: payload });
      } else {
        await nextApi(`/addresses`, { method: "POST", body: payload });
      }
      await fetchAddresses();
      setAddressModalStatus("select");
    } catch (e) {
      const err = e as Error;
      let msg = "保存に失敗しました";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error) msg = parsed.error;
      } catch {
        if (err.message) msg = err.message;
      }
      setAddressError(msg);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!item) return;
    if (!selectedAddress) {
      alert("配送先を選択してください");
      return;
    }

    try {
      type OrderResponse = { message: string; order_id: number };
      const res = await nextApi<unknown, OrderResponse>(`/orders`, {
        method: "POST",
        body: {
          item_id: item.id,
          address_id: selectedAddress.id,
          payment_method: paymentMethod,
        },
      });
      alert("購入が完了しました！");
      router.push(`/transaction/${res.order_id}`);
    } catch (e) {
      const err = e as Error;
      let errorMessage = "購入処理中にエラーが発生しました";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error) errorMessage = parsed.error;
      } catch {
        if (err.message) errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  const renderSelectAddress = () => (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <p className="text-sm text-gray-500">登録済みの住所がありません。新規追加してください。</p>
      )}
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`p-3 px-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
            selectedAddress?.id === addr.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-slate-50"
          }`}
        >
          <button
            type="button"
            className="flex-1 text-left"
            onClick={() => handleSelectAddress(addr)}
          >
            <span className="font-medium">{addr.title}</span>
            <span className="block text-xs text-gray-500">{addr.name}</span>
            <span className="block text-xs text-gray-600">{addr.address}</span>
          </button>
          <button
            type="button"
            className="ml-2 text-sm font-bold text-blue-600 py-1.5 px-3"
            onClick={() => handleStartEdit(addr)}
          >
            修正
          </button>
        </div>
      ))}
      <div className="pt-2" />
      <button
        type="button"
        className="w-full bg-slate-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-slate-600 transition"
        onClick={handleStartCreate}
      >
        + 新しい住所を追加
      </button>
      <button
        type="button"
        className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-600 transition"
        onClick={handleConfirmAddress}
      >
        この住所を使用する
      </button>
    </div>
  );

  const renderAddressForm = () => (
    <div className="space-y-3">
      {addressError && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{addressError}</p>
      )}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">住所名（例: 自宅）</label>
        <input
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="自宅"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">お名前</label>
        <input
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">電話番号（ハイフンなし10〜11桁）</label>
        <input
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={form.phone_number}
          onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
          placeholder="09012345678"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">郵便番号（例: 123-4567）</label>
        <input
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={form.postal_code}
          onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
          placeholder="123-4567"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">住所</label>
        <textarea
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 transition"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>
      <button
        type="button"
        onClick={saveAddress}
        className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-600 transition"
      >
        保存
      </button>
      <button
        type="button"
        onClick={backToSelect}
        className="w-full bg-gray-400 text-white font-bold py-3 rounded-xl mt-2 hover:bg-gray-500 transition"
      >
        戻る
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <header className="h-16 bg-white flex items-center px-4 sticky top-0 z-10 border-b">
        <Link href={`/items/${id}`}><ChevronLeft className="text-gray-600" /></Link>
        <h1 className="flex-1 text-center font-bold mr-6 text-gray-800">購入内容の確認</h1>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              className="object-cover"
              alt={item ? item.title : "商品画像"}
              src={item ? item.images[0] : ""}
              fill
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold line-clamp-2 text-gray-800">{item?.title}</p>
            <p className="text-lg font-bold">¥{item ? formatNumber(item.price) : 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y">
          <button
            type="button"
            onClick={openAddressModal}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-xs text-gray-400">配送先</p>
                {selectedAddress ? (
                  <>
                    <p className="text-sm font-medium text-gray-800">{selectedAddress.title} / {selectedAddress.name}</p>
                    <p className="text-xs text-gray-500">{selectedAddress.address}</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-500">タップして配送先を選択</p>
                )}
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-xs text-gray-400">支払い方法</p>
                <p className="text-sm font-medium text-gray-800">{paymentMethod}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>商品代金</span>
            <span>¥ {item ? formatNumber(item.price) : 0}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>配送料</span>
            <span>無料</span>
          </div>
          <div className="flex justify-between text-sm pt-4 border-t border-dashed border-gray-200">
            <span>所有ポイント</span>
            <span>¥ {formatNumber(user?.points ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>支払い金額</span>
            <span>¥ {item ? formatNumber(item.price) : 0}</span>
          </div>
          <div className="flex justify-between font-bold text-xl pt-4 border-t border-dashed border-gray-200">
            <span>
              {user != null && item != null && user.points - item.price >= 0
                ? "支払い後の残高"
                : "残高が足りません"}
            </span>
            <span>
              {user != null && item != null && user.points - item.price >= 0
                ? `¥ ${formatNumber(user.points - item.price)}`
                : ""}
            </span>
          </div>
        </div>

        <button type="button" className="w-full bg-slate-500 text-white font-bold py-5 rounded-full shadow-xl active:scale-[0.98] transition mt-4"
          onClick={()=>router.push("/user/wallet")}
        >
          チャージする
        </button>
        
        {user != null && item != null && user.points - item.price >= 0 &&
          <button
            type="button"
            onClick={handleConfirmPurchase}
            className="w-full bg-blue-500 text-white font-bold py-5 rounded-full shadow-xl shadow-blue-100 active:scale-[0.98] transition mt-4"
          >
            購入を確定する
          </button>
        }
      </main>

      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={addressModalStatus === "select" ? "配送先を選択" : addressModalStatus === "create" ? "新しい住所を追加" : "住所を修正"}
      >
        {addressModalStatus === "select" && renderSelectAddress()}
        {(addressModalStatus === "create" || addressModalStatus === "edit") && renderAddressForm()}
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="支払い方法">
        <div className="space-y-2">
          {["ポイント", "売上高", "クレジットカード (**** 1234)", "メルペイ残高", "コンビニ払い"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setPaymentMethod(m);
                setIsPaymentModalOpen(false);
              }}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                paymentMethod === m ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-700"
              }`}
            >
              <p className="font-bold text-sm">{m}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

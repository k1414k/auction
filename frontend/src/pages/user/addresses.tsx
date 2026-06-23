import { Modal } from "@/components/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { nextApi } from "@/lib/fetch";
import { Address } from "@/types/address";
import { MapPin, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const emptyForm = {
  title: "",
  name: "",
  phone_number: "",
  postal_code: "",
  address: "",
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await nextApi<unknown, Address[]>("/addresses", { method: "GET" });
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      title: addr.title,
      name: addr.name,
      phone_number: addr.phone_number,
      postal_code: addr.postal_code,
      address: addr.address,
    });
    setError(null);
    setModalOpen(true);
  };

  const saveAddress = async () => {
    const payload = {
      title: form.title.trim(),
      name: form.name.trim(),
      phone_number: form.phone_number.replace(/\D/g, "").slice(0, 11),
      postal_code: form.postal_code.replace(/\D/g, "").replace(/^(\d{3})(\d{4})$/, "$1-$2").slice(0, 8),
      address: form.address.trim(),
    };
    try {
      if (editing) {
        await nextApi(`/addresses/${editing.id}`, { method: "PATCH", body: payload });
      } else {
        await nextApi("/addresses", { method: "POST", body: payload });
      }
      setModalOpen(false);
      await fetchAddresses();
    } catch (e) {
      const err = e as Error;
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed?.error ?? "保存に失敗しました");
      } catch {
        setError("保存に失敗しました");
      }
    }
  };

  const deleteAddress = async (addr: Address) => {
    if (!confirm(`「${addr.title}」を削除しますか？`)) return;
    await nextApi(`/addresses/${addr.id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((item) => item.id !== addr.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="h-14 bg-white flex items-center px-4 border-b sticky top-0 z-10">
        <Link href="/user/profile" className="text-gray-600">戻る</Link>
        <h1 className="flex-1 text-center font-bold text-gray-800 mr-8">住所管理</h1>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-4">
        <button
          type="button"
          onClick={openCreate}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white font-bold rounded-xl"
        >
          <Plus size={18} />
          住所を追加
        </button>

        {loading ? (
          <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
        ) : addresses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">
            登録済みの住所はありません
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex gap-3">
                <MapPin className="text-blue-500 shrink-0" size={22} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{addr.title}</p>
                  <p className="text-sm text-gray-600">{addr.name}</p>
                  <p className="text-sm text-gray-500">{addr.postal_code} {addr.address}</p>
                  <p className="text-xs text-gray-400">{addr.phone_number}</p>
                </div>
              </div>
              <div className="mt-4 flex border-t border-gray-100 pt-3">
                <button type="button" onClick={() => openEdit(addr)} className="flex-1 text-blue-600 font-bold">
                  修正
                </button>
                <button type="button" onClick={() => deleteAddress(addr)} className="flex-1 text-red-600 font-bold flex items-center justify-center gap-1">
                  <Trash2 size={15} />
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "住所を修正" : "住所を追加"}>
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="住所名（例: 自宅）" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="お名前" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="電話番号" value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} />
          <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="郵便番号" value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} />
          <textarea className="w-full p-3 border border-gray-200 rounded-xl h-24" placeholder="住所" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <button type="button" onClick={saveAddress} className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl">
            保存
          </button>
        </div>
      </Modal>
    </div>
  );
}

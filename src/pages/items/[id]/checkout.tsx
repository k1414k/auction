import { nextApi } from '@/lib/fetch';
import { Item } from '@/types/item';
import { formatNumber } from '@/utils/format-number';
import { ChevronLeft, ChevronRight, CreditCard, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<Item | null>(null);

  // モーダルの開閉状態
  const [addressModalStatus, setAddressModalStatus] = useState<"select"|"create"|"edit">("select")
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // 指示通りのカラム名（last_address_name）を使用
  const [lastAddressName, setLastAddressName] = useState("山田 太郎");
  const [lastAddressDetail, setLastAddressDetail] = useState("東京都渋谷区神南1-2-3");
  const [paymentMethod, setPaymentMethod] = useState("ポイント");
  
  
  const SelectAddress = () => {
    return (
      <div className="space-y-3">
        <div className="bg-slate-100 p-2 px-6 rounded-full ring-2 ring-blue-500 cursor-pointer flex items-center justify-between">
          <span>
            自宅 1
          </span>
          <button className='font-bold py-1.5 pl-4' onClick={()=>setAddressModalStatus("edit")}>
            住所修正
          </button>
        </div>
        <div className="bg-slate-100 p-2 px-6 rounded-full cursor-pointer flex items-center justify-between">
          <span>
            自宅 2
          </span>
          <button className='font-bold py-1.5 pl-4'
            onClick={()=> setAddressModalStatus("edit")}
          >
            住所修正
          </button>
        </div>
        
        <button
          className="w-full bg-slate-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-slate-600 transition shadow-lg shadow-blue-50"
          onClick={()=>setAddressModalStatus("create")}
        >
          + 新しい住所追加
        </button>
        <button
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-600 transition shadow-lg shadow-blue-50"
          onClick={()=>setIsAddressModalOpen(false)}
        >
          この住所を使用する
        </button>
      </div>
    )
  }
  const EditAddress = () => {
    return (
      <div className="space-y-1">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">住所名</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={"自宅 1"}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">お名前</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={lastAddressName}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">電話番号</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={"070-0000-0000"}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">郵便番号</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={"〒 １２３−４５６７"}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">住所</label>
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 transition"
            value={lastAddressDetail}
            onChange={(e) => setLastAddressDetail(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setAddressModalStatus("select")}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-600 transition shadow-lg shadow-blue-50"
        >
          保存
        </button>
        <button
          onClick={() => setAddressModalStatus("select")}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-red-600 transition shadow-lg shadow-blue-50"
        >
          戻る
        </button>
      </div>
    )
  }
  const CreateAddress = () => {
    return (
      <div className="space-y-1">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">住所名</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={"自宅 1"}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">お名前</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={lastAddressName}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">電話番号</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={"070-0000-0000"}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">郵便番号</label>
          <input 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={"〒 １２３−４５６７"}
            onChange={(e) => setLastAddressName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1">住所</label>
          <textarea 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 transition"
            value={lastAddressDetail}
            onChange={(e) => setLastAddressDetail(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setAddressModalStatus("select")}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-blue-600 transition shadow-lg shadow-blue-50"
        >
          保存
        </button>
        <button
          onClick={() => setAddressModalStatus("select")}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-xl mt-2 hover:bg-red-600 transition shadow-lg shadow-blue-50"
        >
          戻る
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (!id) return;
    const getItem = async () => {
      try {
        type ResType = { data: Item };
        const res: ResType = await nextApi(`/items/${id}`, { method: "GET" });
        setItem(res.data);
      } catch (e) {
        if (e instanceof Error) {
          const errorMessage = JSON.parse(e.message);
          console.log(errorMessage);
        } else {
          alert("ERR_CODE_500");
        }
      }
    };
    getItem();
  }, [id]);

  // 購入処理
  const handleConfirmPurchase = async () => {
    if (!item) return;

    // 金額チェック
  // 仮のユーザー残高（エラーテスト用）

    const userBalance = 500;
    if (userBalance < item.price) {
      setIsErrorModalOpen(true);
      return;
    }

    try {
      await nextApi(`/orders`, {
        method: "POST",
        body: JSON.stringify({
          item_id: item.id,
          last_address_name: lastAddressName,
          last_address_detail: lastAddressDetail,
          payment_method: paymentMethod,
        }),
      });
      alert("購入が完了しました！");


      router.push("/transaction/id");
    } catch (e) {
      alert("購入処理中にエラーが発生しました");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <header className="h-16 bg-white flex items-center px-4 sticky top-0 z-10 border-b">
        <Link href={`/items/${id}`}><ChevronLeft className="text-gray-600" /></Link>
        <h1 className="flex-1 text-center font-bold mr-6 text-gray-800">購入内容の確認</h1>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* 商品情報カード */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            <Image 
              className="object-cover" 
              alt={item ? item?.title : "商品画像"} 
              src={item ? item?.images[0] : ""} 
              fill
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold line-clamp-2 text-gray-800">{item?.title}</p>
            <p className="text-lg font-bold">¥{item ? formatNumber(item?.price) : 0}</p>
          </div>
        </div>

        {/* 配送先・支払い設定 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y">
          <button 
            onClick={() => setIsAddressModalOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-gray-400" />
              <div className="text-left">
                <p className="text-xs text-gray-400">配送先</p>
                <p className="text-sm font-medium text-gray-800">{lastAddressName}</p>
                <p className="text-xs text-gray-500">{lastAddressDetail}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button 
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

        {/* 金額内訳 */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>商品代金</span>
            <span>¥ {item ? formatNumber(item?.price) : 0}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>配送料</span>
            <span>無料</span>
          </div>
          <div className="flex justify-between text-sm pt-4 border-t border-dashed border-gray-200">
            <span>所有ポイント</span>
            <span>¥ {formatNumber(1234)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>支払い金額</span>
            <span>¥ {item ? formatNumber(item?.price) : 0}</span>
          </div>
          <div className="flex justify-between font-bold text-xl pt-4 border-t border-dashed border-gray-200">
            <span>支払い後の残高 or 残高が足りません</span>
            <span>¥ {formatNumber(1234)}</span>
          </div>
        </div>
       <button 
          className="w-full bg-red-500 text-white font-bold py-5 rounded-full shadow-xl shadow-blue-100 active:scale-[0.98] transition mt-4"
        >
          チャージする
        </button>
 
        <button 
          onClick={handleConfirmPurchase}
          className="w-full bg-blue-500 text-white font-bold py-5 rounded-full shadow-xl shadow-blue-100 active:scale-[0.98] transition mt-4"
        >
          購入を確定する
        </button>
      </main>

      {/* --- モーダルコンポーネント --- */}

      {/* 配送先入力 */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="配送先を選択">
        {addressModalStatus === "select" && <SelectAddress />}
        {addressModalStatus === "create" && <CreateAddress />}
        {addressModalStatus === "edit" && <EditAddress />}
      </Modal>

      {/* 支払い方法選択 */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="支払い方法">
        <div className="space-y-2">
          {["ポイント", "売上高", "クレジットカード (**** 1234)", "メルペイ残高", "コンビニ払い"].map((m) => (
            <button
              key={m}
              onClick={() => { setPaymentMethod(m); setIsPaymentModalOpen(false); }}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${paymentMethod === m ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-700"}`}
            >
              <p className="font-bold text-sm">{m}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
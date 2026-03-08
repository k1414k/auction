import { nextApi } from "@/lib/fetch";
import { apiAssetUrl } from "@/lib/apiAssetUrl";
import { formatNumber } from "@/utils/format-number";
import { useUserStore } from "@/stores/userStore";
import { Send, Package, Truck, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

type OrderDetail = {
  id: number;
  item_id: number;
  item: { id: number; title: string; price: number; image: string | null };
  buyer: { id: number; nickname: string };
  seller: { id: number; nickname: string };
  status: string;
  shipping_address: string | null;
  created_at: string;
};

type Message = {
  id: number;
  content: string;
  user_id: number;
  user_nickname: string;
  created_at: string;
};

const STEPS = ["購入", "発送", "受取", "完了"] as const;
const STATUS_INDEX: Record<string, number> = {
  waiting_payment: 0,
  waiting_shipping: 1,
  waiting_review: 2,
  completed: 3,
};

export default function TransactionPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useUserStore((s) => s.user);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentStep = order ? STATUS_INDEX[order.status] ?? 0 : 0;
  const isBuyer = user && order && order.buyer.id === user.id;
  const isSeller = user && order && order.seller.id === user.id;

  const fetchOrder = useCallback(async () => {
    if (typeof id !== "string") return;
    try {
      const data = await nextApi<unknown, OrderDetail>(`/orders/${id}`, { method: "GET" });
      setOrder(data);
    } catch (e) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          if (parsed?.error) alert(parsed.error);
        } catch {
          alert("取引情報の取得に失敗しました");
        }
      }
      router.replace("/user/profile");
    }
  }, [id, router]);

  const fetchMessages = useCallback(async () => {
    if (typeof id !== "string") return;
    try {
      const data = await nextApi<unknown, Message[]>(`/orders/${id}/messages`, { method: "GET" });
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    fetchMessages();
  }, [fetchOrder, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = messageInput.trim();
    if (!content || sending || typeof id !== "string") return;
    setSending(true);
    try {
      const newMsg = await nextApi<{ content: string }, Message>(`/orders/${id}/messages`, {
        method: "POST",
        body: { content },
      });
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput("");
    } catch (e) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          alert(parsed?.error ?? "送信に失敗しました");
        } catch {
          alert("送信に失敗しました");
        }
      }
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!order || updating || typeof id !== "string") return;
    setUpdating(true);
    try {
      const updated = await nextApi<{ status: string }, OrderDetail>(`/orders/${id}`, {
        method: "PATCH",
        body: { status },
      });
      setOrder(updated);
    } catch (e) {
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message);
          alert(parsed?.error ?? "更新に失敗しました");
        } catch {
          alert("更新に失敗しました");
        }
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-16 pb-24">
      <div className="bg-white p-6 border-b flex justify-around relative">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-4 h-4 rounded-full border-4 border-white ring-1 ring-gray-100 shadow-sm ${
                i <= currentStep ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
            <span className={`text-[10px] font-bold ${i <= currentStep ? "text-blue-500" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
        ))}
        <div className="absolute top-8 left-12 right-12 h-[2px] bg-gray-100" />
      </div>

      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center py-4">
          {order.status === "waiting_shipping" && (
            <>
              <Package className="text-blue-500 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-800">商品の発送をお待ちください</p>
              <p className="text-xs text-gray-400 mt-1">出品者からの発送通知をお送りします</p>
            </>
          )}
          {order.status === "waiting_review" && (
            <>
              <Truck className="text-blue-500 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-800">商品をお受け取りください</p>
              <p className="text-xs text-gray-400 mt-1">受取確認後、取引を完了できます</p>
            </>
          )}
          {order.status === "completed" && (
            <>
              <CheckCircle className="text-green-500 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-800">取引が完了しました</p>
              <p className="text-xs text-gray-400 mt-1">ご利用ありがとうございました</p>
            </>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {order.item.image && (
                <Image src={apiAssetUrl(order.item.image) || ""} alt={order.item.title} fill className="object-cover" unoptimized />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate">{order.item.title}</p>
              <p className="text-lg font-bold text-gray-900">¥{formatNumber(order.item.price)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-800">メッセージ</h4>
          <div className="bg-white rounded-2xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">まだメッセージはありません</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 mb-4 ${m.user_id === user?.id ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                      m.user_id === user?.id ? "bg-blue-500 text-white rounded-tr-none ml-12" : "bg-gray-100 text-gray-700 rounded-tl-none mr-12"
                    }`}
                  >
                    <p className="text-xs opacity-80 mb-1">{m.user_nickname}</p>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {(order.status === "waiting_shipping" || order.status === "waiting_review") && (
          <div className="flex gap-3">
            {isSeller && order.status === "waiting_shipping" && (
              <button
                type="button"
                onClick={() => updateStatus("waiting_review")}
                disabled={updating}
                className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-xl active:scale-95 transition disabled:opacity-50"
              >
                {updating ? "更新中..." : "発送しました"}
              </button>
            )}
            {isBuyer && order.status === "waiting_review" && (
              <>
                <Link href={`/transaction/${id}/rating`} className="flex-1">
                  <button
                    type="button"
                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl active:scale-95 transition"
                  >
                    評価する
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => updateStatus("completed")}
                  disabled={updating}
                  className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-xl active:scale-95 transition disabled:opacity-50"
                >
                  {updating ? "更新中..." : "受け取りました"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t">
        <div className="flex gap-2 max-w-xl mx-auto">
          <input
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm outline-none border-none focus:ring-2 focus:ring-blue-100"
            placeholder="メッセージを入力"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={sending || !messageInput.trim()}
            className="bg-blue-500 text-white p-3 rounded-full shadow-lg disabled:opacity-50 active:scale-95 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

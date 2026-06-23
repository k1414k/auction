import { nextApi } from "@/lib/fetch";
import { Bell, CheckCircle, ChevronRight, Info, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type NotificationItem = {
  id: number;
  title: string;
  body: string | null;
  action_url: string | null;
  category: "notice" | "todo" | string;
  read_at: string | null;
  created_at: string;
};

type Tab = "all" | "todo";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const query = activeTab === "todo" ? "?category=todo" : "";
      const data = await nextApi<unknown, NotificationItem[]>(`/notifications${query}`, { method: "GET" });
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="bg-white min-h-screen pt-16">
      <div className="px-5 py-4 flex items-end justify-between">
        <h1 className="text-2xl font-bold text-gray-800">お知らせ</h1>
      </div>

      <div className="flex px-4 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === "all" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400"}`}
        >
          すべて
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("todo")}
          className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === "todo" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400"}`}
        >
          やることリスト
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">読み込み中...</p>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Bell className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="text-sm">通知はありません</p>
          </div>
        ) : (
          notifications.map((item) => {
            const content = (
              <div className="p-4 flex gap-4 active:bg-gray-50 items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.category === "todo" ? "bg-blue-50 text-blue-500" : "bg-gray-50 text-gray-500"}`}>
                  {item.category === "todo" ? <ShoppingBag /> : item.read_at ? <CheckCircle /> : <Info />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-3">
                    <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                    <span className="text-[10px] text-gray-300 shrink-0">{relativeDate(item.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.body ?? ""}</p>
                </div>
                {item.action_url && <ChevronRight size={14} className="text-gray-300" />}
              </div>
            );

            return item.action_url ? (
              <Link key={item.id} href={item.action_url}>
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })
        )}
      </div>
    </div>
  );
}

function relativeDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return date.toLocaleDateString("ja-JP");
}

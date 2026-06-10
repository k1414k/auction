import { nextApi } from "@/lib/fetch";
import { Smile, Frown, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function RatingPage() {
  const router = useRouter();
  const { id } = router.query;
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating || typeof id !== "string") return;
    setLoading(true);
    try {
      await nextApi(`/orders/${id}`, {
        method: "PATCH",
        body: { status: "completed" },
      });
      alert("評価が送信され、取引が完了しました");
      router.replace(`/transaction/${id}`);
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
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">取引お疲れ様でした！</h1>
          <p className="text-sm text-gray-400 mt-2">相手の評価をして取引を完了しましょう</p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRating("good")}
            className={`flex-1 flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border-2 transition ${
              rating === "good" ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`}
          >
            <Smile size={48} className="text-yellow-400" />
            <span className="mt-2 font-bold text-gray-600">良かった</span>
          </button>
          <button
            type="button"
            onClick={() => setRating("bad")}
            className={`flex-1 flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border-2 transition ${
              rating === "bad" ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`}
          >
            <Frown size={48} className="text-gray-400" />
            <span className="mt-2 font-bold text-gray-600">残念</span>
          </button>
        </div>

        <div className="relative">
          <MessageSquare className="absolute top-4 left-4 text-gray-300" size={20} />
          <textarea
            className="w-full bg-white rounded-2xl p-5 pt-10 text-sm shadow-sm h-40 outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            placeholder="感謝の気持ちを伝えましょう"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!rating || loading}
          className="w-full bg-blue-500 text-white font-bold py-5 rounded-full shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-[0.98] transition"
        >
          {loading ? "送信中..." : "評価を投稿して取引を完了する"}
        </button>

        <Link href={`/transaction/${id}`} className="block text-center text-sm text-gray-500 hover:text-gray-700">
          評価をスキップして取引詳細に戻る
        </Link>
      </div>
    </div>
  );
}

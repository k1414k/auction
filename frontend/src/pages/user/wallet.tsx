import { nextApi } from "@/lib/fetch";
import { useUserStore } from "@/stores/userStore";
import type { WalletTransaction, WalletAccount } from "@/types/wallet";
import { formatNumber } from "@/utils/format-number";
import { Spinner } from "@/components/ui/Spinner";
import { WalletTransactionList } from "@/components/WalletTransactionList";
import { Banknote, Coins, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

type HistoryFilter = "all" | WalletAccount;

export default function Wallet() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [chargeAmount, setChargeAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");

  const balance = user?.balance ?? 0;
  const points = user?.points ?? 0;
  const amountNum = parseInt(chargeAmount, 10) || 0;
  const canCharge = amountNum > 0 && amountNum <= balance && !loading;

  const fetchUser = useCallback(async () => {
    try {
      type Res = { user: { balance: number; points: number; nickname: string; name: string; email: string; introduction: string; avatar_url: string | null; role: string } };
      const res = await nextApi<unknown, Res>("/auth/user", { method: "GET" });
      if (res.user) setUser(res.user);
    } catch {
      router.push("/auth/sign-in");
    }
  }, [router, setUser]);

  const fetchTransactions = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await nextApi<unknown, WalletTransaction[]>("/user/wallet-transactions", {
        method: "GET",
      });
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setHistoryError("ポイント・売上履歴を取得できませんでした");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchTransactions();
  }, [fetchTransactions, fetchUser]);

  const filteredTransactions = useMemo(
    () =>
      historyFilter === "all"
        ? transactions
        : transactions.filter((transaction) => transaction.account === historyFilter),
    [historyFilter, transactions]
  );

  const handleCharge = async () => {
    if (!canCharge || !user) return;
    setError(null);
    setLoading(true);
    try {
      const data = await nextApi<{ amount: number; type: string }, { balance: number; points: number }>("/user/change-wallet", {
        method: "PATCH",
        body: { amount: amountNum, type: "charge" },
      });
      setUser({ ...user, balance: data.balance, points: data.points });
      setChargeAmount("");
      await fetchTransactions();
    } catch (e) {
      const err = e as Error;
      let msg = "チャージに失敗しました";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error) msg = parsed.error;
      } catch {
        if (err.message) msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const setMaxCharge = () => {
    setChargeAmount(String(balance));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="h-14 bg-white flex items-center px-4 border-b sticky top-0 z-10">
        <Link href="/user/profile" className="text-gray-600">戻る</Link>
        <h1 className="flex-1 text-center font-bold text-gray-800 mr-8">ウォレット</h1>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">売上高</p>
          <div className="flex items-center gap-2">
            <Banknote className="text-amber-500" size={24} />
            <span className="text-2xl font-bold text-gray-800">¥ {formatNumber(balance)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">商品が売れたらここに入ります。ポイントにチャージして購入に使えます。</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">ポイント残高</p>
          <div className="flex items-center gap-2">
            <Coins className="text-blue-500" size={24} />
            <span className="text-2xl font-bold text-gray-800">P {formatNumber(points)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">購入時にポイントで支払います。売上からチャージできます。</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-3">売上をポイントにチャージ</h2>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-3">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={balance}
              value={chargeAmount}
              onChange={(e) => {
                setChargeAmount(e.target.value);
                setError(null);
              }}
              placeholder="チャージする金額"
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={setMaxCharge}
              className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              全額
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">最大 ¥{formatNumber(balance)} までチャージできます。</p>
          <button
            type="button"
            onClick={handleCharge}
            disabled={!canCharge}
            className="w-full mt-4 py-3 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" variant="white" />
                処理中...
              </>
            ) : (
              "チャージする"
            )}
          </button>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">ガイド</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>商品が売れると、売上高に金額が入ります。</li>
            <li>売上高をポイントにチャージすると、他の商品の購入に使えます。</li>
            <li>チャージしたポイントは購入時に即時で使えます。</li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <History size={20} className="text-gray-500" />
            <h2 className="font-bold text-gray-800">ポイント・売上履歴</h2>
          </div>

          <div className="mt-4 flex gap-2">
            {([
              ["all", "すべて"],
              ["points", "ポイント"],
              ["balance", "売上"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setHistoryFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  historyFilter === value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-2">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : historyError ? (
              <div className="py-6 text-center">
                <p className="text-sm text-red-600">{historyError}</p>
                <button
                  type="button"
                  onClick={fetchTransactions}
                  className="mt-3 rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
                >
                  再試行
                </button>
              </div>
            ) : (
              <WalletTransactionList
                transactions={filteredTransactions}
                emptyMessage={
                  historyFilter === "points"
                    ? "ポイント履歴はまだありません"
                    : historyFilter === "balance"
                      ? "売上履歴はまだありません"
                      : "ポイント・売上履歴はまだありません"
                }
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

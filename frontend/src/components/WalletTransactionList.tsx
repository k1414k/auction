import type { WalletTransaction } from "@/types/wallet";
import { formatNumber } from "@/utils/format-number";
import Link from "next/link";

type Props = {
  transactions: WalletTransaction[];
  emptyMessage?: string;
};

export function WalletTransactionList({
  transactions,
  emptyMessage = "履歴はまだありません",
}: Props) {
  if (transactions.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((transaction) => {
        const content = (
          <div className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {transaction.description}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {accountLabel(transaction)} ・ {formatDate(transaction.created_at)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`text-sm font-bold ${
                    transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatAmount(transaction)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  残高 {formatBalance(transaction)}
                </p>
              </div>
            </div>
          </div>
        );

        return transaction.order_id ? (
          <Link
            key={transaction.id}
            href={`/transaction/${transaction.order_id}`}
            className="block rounded-lg transition hover:bg-gray-50"
          >
            {content}
          </Link>
        ) : (
          <div key={transaction.id}>{content}</div>
        );
      })}
    </div>
  );
}

function accountLabel(transaction: WalletTransaction) {
  return transaction.account === "points" ? "ポイント" : "売上";
}

function formatAmount(transaction: WalletTransaction) {
  const sign = transaction.amount >= 0 ? "+" : "-";
  const amount = formatNumber(Math.abs(transaction.amount));

  return transaction.account === "points"
    ? `${sign}${amount} P`
    : `${sign}¥${amount}`;
}

function formatBalance(transaction: WalletTransaction) {
  return transaction.account === "points"
    ? `${formatNumber(transaction.points_after)} P`
    : `¥${formatNumber(transaction.balance_after)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

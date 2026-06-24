export type WalletAccount = "points" | "balance";

export type WalletTransactionKind =
  | "purchase"
  | "sale"
  | "charge"
  | "refund"
  | "adjustment";

export type WalletTransaction = {
  id: number;
  account: WalletAccount;
  kind: WalletTransactionKind;
  amount: number;
  balance_after: number;
  points_after: number;
  description: string;
  order_id: number | null;
  created_at: string;
};

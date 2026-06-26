export type ViewHistoryItem = {
  id: number;
  title: string;
  price: number;
  image: string | null;
  viewed_at: string;
};

const STORAGE_KEY = "auction_view_history";
const HISTORY_LIMIT = 30;

function isViewHistoryItem(value: unknown): value is ViewHistoryItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    (typeof item.image === "string" || item.image === null) &&
    typeof item.viewed_at === "string"
  );
}

export function readViewHistory(): ViewHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isViewHistoryItem) : [];
  } catch {
    return [];
  }
}

export function addViewHistory(item: Omit<ViewHistoryItem, "viewed_at">) {
  if (typeof window === "undefined") return;

  const entry: ViewHistoryItem = {
    ...item,
    viewed_at: new Date().toISOString(),
  };

  const next = [
    entry,
    ...readViewHistory().filter((historyItem) => historyItem.id !== item.id),
  ].slice(0, HISTORY_LIMIT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable in private browsing or quota-exceeded states.
  }
}

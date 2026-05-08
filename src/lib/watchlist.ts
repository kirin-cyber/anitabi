export type WatchStatus = "want" | "watching" | "watched";

export interface WatchlistItem {
  id: number;
  title: string;
  image: string;
  status: WatchStatus;
  addedAt: number;
}

export const STORAGE_KEY = "anitabi-watchlist";

export const STATUS_LABELS: Record<WatchStatus, string> = {
  want: "見たい",
  watching: "視聴中",
  watched: "見た",
};

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveWatchlist(list: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

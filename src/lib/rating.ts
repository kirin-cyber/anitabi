// アニメ詳細ページの★評価機能用ユーティリティ
// ログイン不要・localStorageに保存する。既存の watchlist.ts とキー設計・関数命名を揃えている。

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface RatingItem {
  id: number;
  rating: Rating;
  ratedAt: number;
}

export const RATING_STORAGE_KEY = "anitabi-ratings";

export function getRatings(): RatingItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRatings(list: RatingItem[]) {
  try {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // プライベートモード等でlocalStorageが使えない場合は保存をあきらめる
  }
}

// 指定アニメの現在の評価を取得（未評価ならnull）
export function getRating(animeId: number): Rating | null {
  try {
    const item = getRatings().find((i) => i.id === animeId);
    return item?.rating ?? null;
  } catch {
    return null;
  }
}

// 評価を付ける・付け直す
export function setRating(animeId: number, rating: Rating): RatingItem[] {
  const list = getRatings().filter((i) => i.id !== animeId);
  const newItem: RatingItem = { id: animeId, rating, ratedAt: Date.now() };
  const next = [...list, newItem];
  saveRatings(next);
  return next;
}

// 評価を削除する
export function removeRating(animeId: number): RatingItem[] {
  const next = getRatings().filter((i) => i.id !== animeId);
  saveRatings(next);
  return next;
}

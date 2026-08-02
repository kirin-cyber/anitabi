// 季節（クール）軸ユーティリティ
// トップページ・ランキングページで「現在のクール」を判定・表示するための共通ロジック。
// 既存の src/lib/annict.ts の getCurrentSeason() / getNextSeason() とは別関数名にして衝突を回避している。

export type SeasonName = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export interface SeasonInfo {
  year: number;
  season: SeasonName;
}

const SEASON_ORDER: readonly SeasonName[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

const SEASON_LABEL_JA: Record<SeasonName, string> = {
  WINTER: "冬",
  SPRING: "春",
  SUMMER: "夏",
  FALL: "秋",
};

const SEASON_LABEL_EN: Record<SeasonName, string> = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

// Annict APIのシーズン文字列表記（例: "2026-summer"）との対応
const SEASON_TO_ANNICT: Record<SeasonName, string> = {
  WINTER: "winter",
  SPRING: "spring",
  SUMMER: "summer",
  FALL: "autumn",
};

// 月からクール（季節）を判定
function monthToSeasonName(month: number): SeasonName {
  if (month <= 3) return "WINTER";
  if (month <= 6) return "SPRING";
  if (month <= 9) return "SUMMER";
  return "FALL";
}

// 現在（または指定日時）のクール情報を取得
export function getCurrentSeasonInfo(date: Date = new Date()): SeasonInfo {
  return { year: date.getFullYear(), season: monthToSeasonName(date.getMonth() + 1) };
}

// 指定クールから offset 分だけずらしたクール情報を取得（+1で次クール、-1で前クール）
export function shiftSeasonInfo(info: SeasonInfo, offset: number): SeasonInfo {
  const currentIndex = SEASON_ORDER.indexOf(info.season);
  const totalIndex = currentIndex + offset;
  const yearDiff = Math.floor(totalIndex / SEASON_ORDER.length);
  const seasonIndex = ((totalIndex % SEASON_ORDER.length) + SEASON_ORDER.length) % SEASON_ORDER.length;
  return { year: info.year + yearDiff, season: SEASON_ORDER[seasonIndex] };
}

// 2つのクール情報が同一か判定
export function isSameSeasonInfo(a: SeasonInfo, b: SeasonInfo): boolean {
  return a.year === b.year && a.season === b.season;
}

// 「2026年夏」形式のラベル
export function formatSeasonLabel(info: SeasonInfo, locale: "ja" | "en" = "ja"): string {
  return locale === "en"
    ? `${SEASON_LABEL_EN[info.season]} ${info.year}`
    : `${info.year}年${SEASON_LABEL_JA[info.season]}`;
}

// 「2026年夏アニメ」形式のラベル（見出し・メタタイトル向け）
export function formatSeasonAnimeLabel(info: SeasonInfo, locale: "ja" | "en" = "ja"): string {
  return locale === "en"
    ? `${SEASON_LABEL_EN[info.season]} ${info.year} Anime`
    : `${info.year}年${SEASON_LABEL_JA[info.season]}アニメ`;
}

// Annict APIのシーズン文字列（例: "2026-summer"）に変換
export function toAnnictSeasonString(info: SeasonInfo): string {
  return `${info.year}-${SEASON_TO_ANNICT[info.season]}`;
}

// URLクエリパラメータ用の文字列に変換（例: { year: "2026", season: "summer" }）
export function seasonInfoToQuery(info: SeasonInfo): { year: string; season: string } {
  return { year: String(info.year), season: info.season.toLowerCase() };
}

// URLクエリパラメータ（year, season）からクール情報を復元。不正・欠落時はnull
export function parseSeasonQuery(
  year: string | undefined,
  season: string | undefined,
): SeasonInfo | null {
  if (!year || !season) return null;
  const parsedYear = Number(year);
  const normalizedSeason = season.toUpperCase();
  if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 3000) return null;
  if (!SEASON_ORDER.includes(normalizedSeason as SeasonName)) return null;
  return { year: parsedYear, season: normalizedSeason as SeasonName };
}

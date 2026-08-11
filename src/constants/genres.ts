export const GENRE_MAP: Record<string, string> = {
  Action: "アクション",
  Adventure: "アドベンチャー",
  Comedy: "コメディ",
  Drama: "ドラマ",
  Fantasy: "ファンタジー",
  Horror: "ホラー",
  Mystery: "ミステリー",
  Romance: "恋愛",
  "Sci-Fi": "SF",
  "Slice of Life": "日常",
  Sports: "スポーツ",
  Supernatural: "超自然",
  Thriller: "スリラー",
  Psychological: "サイコ",
  Mecha: "ロボット",
  Music: "音楽",
};

export function mapGenre(g: string): string {
  return GENRE_MAP[g] ?? g;
}

export function genreColor(g: string): string {
  switch (g) {
    case "アクション": return "bg-genre-1";
    case "ファンタジー": return "bg-genre-2";
    case "コメディ": return "bg-genre-3";
    case "恋愛": return "bg-genre-4";
    case "SF": return "bg-genre-5";
    case "スポーツ": return "bg-genre-6";
    case "ホラー": return "bg-genre-7";
    case "日常": return "bg-genre-8";
    case "ドラマ": return "bg-genre-9";
    case "ミステリー": return "bg-genre-10";
    default: return "bg-slate-500";
  }
}

export const GENRES = [
  { label: "アクション", color: "bg-genre-1" },
  { label: "ファンタジー", color: "bg-genre-2" },
  { label: "コメディ", color: "bg-genre-3" },
  { label: "恋愛", color: "bg-genre-4" },
  { label: "SF", color: "bg-genre-5" },
  { label: "スポーツ", color: "bg-genre-6" },
  { label: "ホラー", color: "bg-genre-7" },
  { label: "日常", color: "bg-genre-8" },
  { label: "ドラマ", color: "bg-genre-9" },
  { label: "ミステリー", color: "bg-genre-10" },
] as const;

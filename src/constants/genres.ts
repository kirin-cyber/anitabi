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
    case "アクション": return "bg-purple-600";
    case "ファンタジー": return "bg-teal-500";
    case "コメディ": return "bg-amber-500";
    case "恋愛": return "bg-pink-500";
    case "SF": return "bg-blue-600";
    case "スポーツ": return "bg-green-600";
    case "ホラー": return "bg-red-400";
    case "日常": return "bg-gray-500";
    case "ドラマ": return "bg-gray-600";
    case "ミステリー": return "bg-purple-700";
    default: return "bg-slate-500";
  }
}

export const GENRES = [
  { label: "アクション", color: "bg-purple-600" },
  { label: "ファンタジー", color: "bg-teal-500" },
  { label: "コメディ", color: "bg-amber-500" },
  { label: "恋愛", color: "bg-pink-500" },
  { label: "SF", color: "bg-blue-600" },
  { label: "スポーツ", color: "bg-green-600" },
  { label: "ホラー", color: "bg-red-400" },
  { label: "日常", color: "bg-gray-500" },
  { label: "ドラマ", color: "bg-gray-600" },
  { label: "ミステリー", color: "bg-purple-700" },
] as const;

// 診断の質問定義
export const QUESTIONS = [
  {
    id: "q1",
    title: "Q1. どんな気分？",
    subtitle: "今の気分に一番近いものを選んでね",
    options: [
      { value: "笑いたい", emoji: "😂", label: "笑いたい" },
      { value: "泣きたい", emoji: "😢", label: "泣きたい" },
      { value: "ドキドキしたい", emoji: "💓", label: "ドキドキしたい" },
      { value: "ゾクゾクしたい", emoji: "😈", label: "ゾクゾクしたい" },
      { value: "癒されたい", emoji: "🌿", label: "癒されたい" },
    ],
  },
  {
    id: "q2",
    title: "Q2. どっち派？",
    subtitle: "好みのスタイルを選んでね",
    options: [
      { value: "アクション派", emoji: "⚔️", label: "アクション派" },
      { value: "ストーリー派", emoji: "📖", label: "ストーリー派" },
      { value: "どっちも好き", emoji: "✨", label: "どっちも好き" },
    ],
  },
  {
    id: "q3",
    title: "Q3. どのくらい観たい？",
    subtitle: "話数の好みを選んでね",
    options: [
      { value: "短め", emoji: "⚡", label: "サクッと（1〜13話）" },
      { value: "スタンダード", emoji: "📺", label: "スタンダード（12〜26話）" },
      { value: "長編OK", emoji: "🎬", label: "長編OK（制限なし）" },
    ],
  },
] as const;

// ガチモード追加質問 Q4〜Q6（通常の単一選択）
export const GACHI_QUESTIONS = [
  {
    id: "q4",
    title: "Q4. 視聴ペースは？",
    subtitle: "どのくらいのペースで観たい？",
    options: [
      { value: "一気見", emoji: "🔥", label: "一気見したい" },
      { value: "毎週", emoji: "📅", label: "毎週1話ずつ" },
      { value: "のんびり", emoji: "☕", label: "のんびり気分" },
    ],
  },
  {
    id: "q5",
    title: "Q5. 原作の種類は？",
    subtitle: "好みの原作タイプを選んでね",
    options: [
      { value: "漫画", emoji: "📚", label: "漫画原作" },
      { value: "小説", emoji: "📖", label: "小説・ラノベ原作" },
      { value: "オリジナル", emoji: "✨", label: "アニメオリジナル" },
      { value: "何でも", emoji: "🎲", label: "何でもOK" },
    ],
  },
  {
    id: "q6",
    title: "Q6. 好きなキャラ像は？",
    subtitle: "好みのキャラクタータイプを選んでね",
    options: [
      { value: "最強系", emoji: "💪", label: "最強系" },
      { value: "成長系", emoji: "🌱", label: "成長系" },
      { value: "チームもの", emoji: "🤝", label: "チームもの" },
      { value: "日常系", emoji: "🌸", label: "日常系" },
    ],
  },
] as const;

// Q7：複数選択（避けたい要素）
export const Q7_QUESTION = {
  id: "q7",
  title: "Q7. 避けたい要素は？",
  subtitle: "複数選択OK・なければ「指定なし」を選んでね",
  options: [
    { value: "グロ", emoji: "🩸", label: "グロ・バイオレンス" },
    { value: "鬱", emoji: "💀", label: "鬱展開" },
    { value: "ハーレム", emoji: "💕", label: "ハーレム" },
    { value: "百合", emoji: "🌹", label: "百合" },
    { value: "BL", emoji: "💙", label: "BL" },
    { value: "指定なし", emoji: "✅", label: "指定なし（何でもOK）" },
  ],
} as const;

// Q1×Q2 ジャンルマッピング（CLAUDE.md準拠・全15パターン）
export const GENRE_MAP: Record<string, Record<string, string[]>> = {
  笑いたい: {
    アクション派: ["コメディ", "アクション"],
    ストーリー派: ["コメディ", "ドラマ"],
    どっちも好き: ["コメディ"],
  },
  泣きたい: {
    アクション派: ["感動", "アクション"],
    ストーリー派: ["感動", "ドラマ"],
    どっちも好き: ["感動"],
  },
  ドキドキしたい: {
    アクション派: ["アクション", "SF"],
    ストーリー派: ["ミステリー", "ドラマ"],
    どっちも好き: ["アクション", "ミステリー"],
  },
  ゾクゾクしたい: {
    アクション派: ["ホラー", "アクション"],
    ストーリー派: ["ホラー", "ミステリー"],
    どっちも好き: ["ホラー"],
  },
  癒されたい: {
    アクション派: ["日常", "スポーツ"],
    ストーリー派: ["日常", "ドラマ"],
    どっちも好き: ["日常"],
  },
};

// ジャンル別Tailwindカラー（CLAUDE.md準拠）
export const GENRE_COLORS: Record<string, string> = {
  アクション: "bg-purple-600",
  ファンタジー: "bg-teal-500",
  コメディ: "bg-amber-500",
  恋愛: "bg-pink-500",
  SF: "bg-blue-600",
  スポーツ: "bg-green-600",
  ホラー: "bg-red-400",
  日常: "bg-gray-500",
  ドラマ: "bg-gray-600",
  ミステリー: "bg-purple-700",
  感動: "bg-pink-400",
};

// ダミー結果データ（全ジャンル網羅）
export interface DiagnosisAnime {
  id: number;
  title: string;
  genres: string[];
  episodes: number;
  description: string;
  score: number;
}

export const DUMMY_RESULTS: DiagnosisAnime[] = [
  { id: 1, title: "ソードアート・オンライン", genres: ["アクション", "ファンタジー"], episodes: 25, description: "仮想世界に閉じ込められたプレイヤーたちの命がけのバトル。", score: 4.5 },
  { id: 2, title: "鬼滅の刃", genres: ["アクション", "感動"], episodes: 26, description: "家族を鬼に殺された少年が、妹を人間に戻すため鬼殺隊に入る。", score: 4.8 },
  { id: 3, title: "SPY×FAMILY", genres: ["コメディ", "アクション"], episodes: 25, description: "スパイ・殺し屋・超能力者の仮初め家族が繰り広げるホームコメディ。", score: 4.6 },
  { id: 4, title: "かぐや様は告らせたい", genres: ["コメディ", "恋愛"], episodes: 12, description: "天才たちの恋愛頭脳戦。先に告白した方が負け！", score: 4.7 },
  { id: 5, title: "あの花", genres: ["感動", "ドラマ"], episodes: 11, description: "幼馴染の死を乗り越えられない少年たちの再生の物語。", score: 4.6 },
  { id: 6, title: "ヴァイオレット・エヴァーガーデン", genres: ["感動", "ドラマ"], episodes: 13, description: "「愛してる」の意味を知りたい元兵士の少女の手紙代筆物語。", score: 4.9 },
  { id: 7, title: "STEINS;GATE", genres: ["SF", "ミステリー"], episodes: 24, description: "タイムマシンを発明した厨二病の科学者が世界線を渡る。", score: 4.9 },
  { id: 8, title: "約束のネバーランド", genres: ["ミステリー", "ホラー"], episodes: 12, description: "楽園のような孤児院に隠された恐ろしい秘密。", score: 4.5 },
  { id: 9, title: "東京喰種", genres: ["ホラー", "アクション"], episodes: 12, description: "半喰種となった青年の、人間と喰種の間で揺れる苦悩。", score: 4.3 },
  { id: 10, title: "ゆるキャン△", genres: ["日常"], episodes: 12, description: "女子高生たちのゆるやかなアウトドアキャンプライフ。", score: 4.7 },
  { id: 11, title: "ハイキュー!!", genres: ["スポーツ", "日常"], episodes: 25, description: "小さな巨人を目指す少年のバレーボール青春ストーリー。", score: 4.8 },
  { id: 12, title: "よつばと!", genres: ["コメディ", "日常"], episodes: 13, description: "元気いっぱいの5歳児よつばの何気ない日常。", score: 4.4 },
  { id: 13, title: "進撃の巨人", genres: ["アクション", "ドラマ"], episodes: 25, description: "巨人に支配された世界で自由を求めて戦う人類の物語。", score: 4.9 },
  { id: 14, title: "四月は君の嘘", genres: ["感動", "ドラマ"], episodes: 22, description: "ピアノを弾けなくなった少年と自由奔放なヴァイオリニストの出会い。", score: 4.7 },
  { id: 15, title: "Another", genres: ["ホラー", "ミステリー"], episodes: 12, description: "あるクラスに纏わる呪いと連鎖する死の謎を追う。", score: 4.2 },
];

// 診断ロジック: Q1×Q2でジャンル絞り込み → Q3で話数フィルタ → 上位5件返却
export function getDiagnosisResults(
  q1: string,
  q2: string,
  q3: string,
): DiagnosisAnime[] {
  const targetGenres = GENRE_MAP[q1]?.[q2] ?? [];

  // 話数フィルタ範囲
  const episodeRange =
    q3 === "短め"
      ? { min: 1, max: 13 }
      : q3 === "スタンダード"
        ? { min: 12, max: 26 }
        : { min: 1, max: 9999 };

  // ジャンルマッチ度でスコアリング
  const scored = DUMMY_RESULTS.filter(
    (anime) =>
      anime.episodes >= episodeRange.min &&
      anime.episodes <= episodeRange.max,
  ).map((anime) => {
    const matchCount = anime.genres.filter((g) =>
      targetGenres.includes(g),
    ).length;
    return { ...anime, matchScore: matchCount };
  });

  // マッチ度 → スコア順でソート、上位5件
  scored.sort((a, b) => b.matchScore - a.matchScore || b.score - a.score);

  // 話数フィルタで結果が少ない場合、フィルタなしで再取得
  if (scored.length === 0) {
    const fallback = DUMMY_RESULTS.map((anime) => {
      const matchCount = anime.genres.filter((g) =>
        targetGenres.includes(g),
      ).length;
      return { ...anime, matchScore: matchCount };
    });
    fallback.sort((a, b) => b.matchScore - a.matchScore || b.score - a.score);
    return fallback.slice(0, 10);
  }

  return scored.slice(0, 10);
}

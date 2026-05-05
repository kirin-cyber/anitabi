// ランク計算（デビュー年から自動・毎年1月1日基準）
const CURRENT_YEAR = new Date().getFullYear();

export type Rank = "新人" | "中堅" | "ベテラン" | "レジェンド";

export const RANK_COLORS: Record<Rank, string> = {
  新人: "bg-red-400",
  中堅: "bg-amber-500",
  ベテラン: "bg-teal-500",
  レジェンド: "bg-purple-600",
};

export const RANKS: Rank[] = ["新人", "中堅", "ベテラン", "レジェンド"];

export function calcRank(debutYear: number): Rank {
  const years = CURRENT_YEAR - debutYear;
  if (years <= 3) return "新人";
  if (years <= 10) return "中堅";
  if (years <= 20) return "ベテラン";
  return "レジェンド";
}

export interface VoiceActor {
  id: number;
  name: string;
  nameEn: string;
  debutYear: number;
  birthday: string;
  description: string;
  // 代表作（アニメID対応あれば紐づけ可能）
  notableRoles: { character: string; anime: string }[];
  // 今季出演作品
  currentSeasonRoles: { character: string; anime: string }[];
}

export const DUMMY_VOICE_ACTORS: VoiceActor[] = [
  {
    id: 1,
    name: "山寺 宏一",
    nameEn: "Koichi Yamadera",
    debutYear: 1985,
    birthday: "1961年6月17日",
    description: "七色の声を持つ声優界のレジェンド。洋画吹き替えからアニメまで幅広く活躍。",
    notableRoles: [
      { character: "スパイク・スピーゲル", anime: "カウボーイビバップ" },
      { character: "加持リョウジ", anime: "新世紀エヴァンゲリオン" },
      { character: "ジーニー", anime: "アラジン" },
    ],
    currentSeasonRoles: [
      { character: "ナレーション", anime: "深淵のコード" },
    ],
  },
  {
    id: 2,
    name: "林原 めぐみ",
    nameEn: "Megumi Hayashibara",
    debutYear: 1986,
    birthday: "1967年3月30日",
    description: "声優アーティストの先駆者。90年代を代表する声優として今なお第一線で活躍。",
    notableRoles: [
      { character: "綾波レイ", anime: "新世紀エヴァンゲリオン" },
      { character: "リナ＝インバース", anime: "スレイヤーズ" },
      { character: "灰原哀", anime: "名探偵コナン" },
    ],
    currentSeasonRoles: [],
  },
  {
    id: 3,
    name: "櫻井 孝宏",
    nameEn: "Takahiro Sakurai",
    debutYear: 1996,
    birthday: "1974年6月13日",
    description: "低音ボイスが魅力のベテラン声優。クールなキャラクターを多数演じる。",
    notableRoles: [
      { character: "雲雀恭弥", anime: "家庭教師ヒットマンREBORN!" },
      { character: "ロロノア・ゾロ（代役）", anime: "ONE PIECE" },
      { character: "冨岡義勇", anime: "鬼滅の刃" },
    ],
    currentSeasonRoles: [
      { character: "謎の師匠", anime: "ソードアート・オンライン Alternative" },
    ],
  },
  {
    id: 4,
    name: "花澤 香菜",
    nameEn: "Kana Hanazawa",
    debutYear: 2003,
    birthday: "1989年2月25日",
    description: "透明感のある声質で人気のベテラン声優。歌手としても活動。",
    notableRoles: [
      { character: "千石撫子", anime: "化物語" },
      { character: "天使", anime: "Angel Beats!" },
      { character: "小野寺小咲", anime: "ニセコイ" },
    ],
    currentSeasonRoles: [
      { character: "ヒロイン", anime: "星降る夜のアリア" },
    ],
  },
  {
    id: 5,
    name: "松岡 禎丞",
    nameEn: "Yoshitsugu Matsuoka",
    debutYear: 2009,
    birthday: "1986年9月17日",
    description: "熱血演技が持ち味の声優。主人公役を数多く担当。",
    notableRoles: [
      { character: "キリト", anime: "ソードアート・オンライン" },
      { character: "伊藤誠", anime: "食戟のソーマ" },
      { character: "ペテルギウス", anime: "Re:ゼロから始める異世界生活" },
    ],
    currentSeasonRoles: [
      { character: "主人公", anime: "ソードアート・オンライン Alternative" },
    ],
  },
  {
    id: 6,
    name: "鬼頭 明里",
    nameEn: "Akari Kito",
    debutYear: 2014,
    birthday: "1994年10月16日",
    description: "歌唱力も高い人気声優。可愛らしい声から力強い演技まで幅広い。",
    notableRoles: [
      { character: "竈門禰豆子", anime: "鬼滅の刃" },
      { character: "安達桜", anime: "安達としまむら" },
    ],
    currentSeasonRoles: [
      { character: "サブヒロイン", anime: "魔法使いの約束 -Season 2-" },
    ],
  },
  {
    id: 7,
    name: "石川 界人",
    nameEn: "Kaito Ishikawa",
    debutYear: 2012,
    birthday: "1993年10月13日",
    description: "爽やかな声が特徴の実力派声優。スポーツアニメの主人公を多く演じる。",
    notableRoles: [
      { character: "影山飛雄", anime: "ハイキュー!!" },
      { character: "ゲルド", anime: "盾の勇者の成り上がり" },
    ],
    currentSeasonRoles: [
      { character: "ライバル", anime: "僕のヒーローアカデミア" },
    ],
  },
  {
    id: 8,
    name: "楠木 ともり",
    nameEn: "Tomori Kusunoki",
    debutYear: 2017,
    birthday: "1999年12月22日",
    description: "若手実力派として注目の声優・アーティスト。繊細な演技に定評がある。",
    notableRoles: [
      { character: "レナ", anime: "86-エイティシックス-" },
      { character: "優木せつ菜", anime: "ラブライブ!虹ヶ咲学園" },
    ],
    currentSeasonRoles: [
      { character: "メインヒロイン", anime: "日常のぜんぶ" },
    ],
  },
  {
    id: 9,
    name: "内田 雄馬",
    nameEn: "Yuma Uchida",
    debutYear: 2012,
    birthday: "1992年9月21日",
    description: "歌手としても活躍する人気男性声優。姉は声優の内田真礼。",
    notableRoles: [
      { character: "アッシュ・リンクス", anime: "BANANA FISH" },
      { character: "勝己", anime: "僕のヒーローアカデミア" },
    ],
    currentSeasonRoles: [
      { character: "主人公の親友", anime: "深淵のコード" },
    ],
  },
  {
    id: 10,
    name: "會澤 このみ",
    nameEn: "Konomi Aizawa",
    debutYear: 2024,
    birthday: "2003年5月10日",
    description: "新世代の注目新人声優。オーディションで主役に抜擢され話題に。",
    notableRoles: [
      { character: "マオ", anime: "薬屋のひとりごと（第2期）" },
    ],
    currentSeasonRoles: [
      { character: "新キャラ", anime: "Re:ゼロから始める異世界生活" },
    ],
  },
];

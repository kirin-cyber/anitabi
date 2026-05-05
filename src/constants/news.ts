export interface CurrentSeasonAnime {
  id: number;
  title: string;
  day: string;
  time: string;
  currentEpisode: number;
  totalEpisodes: number;
  streaming: string;
  officialUrl: string;
  twitterUrl: string;
  streamingUrl: string;
}

export interface UpcomingAnime {
  id: number;
  title: string;
  startDate: string;
  broadcaster: string;
  officialUrl: string;
  twitterUrl: string;
  streamingUrl: string;
}

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  date: string;
  officialUrl: string;
  twitterUrl: string;
}

// 今季（2026年冬）
export const CURRENT_SEASON: CurrentSeasonAnime[] = [
  {
    id: 1,
    title: "ダンダダン 第2期",
    day: "木曜",
    time: "23:00",
    currentEpisode: 8,
    totalEpisodes: 24,
    streaming: "Netflix",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 2,
    title: "転スラ 第4期",
    day: "水曜",
    time: "22:00",
    currentEpisode: 9,
    totalEpisodes: 25,
    streaming: "Amazon",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 3,
    title: "ブルーロック VS U-20",
    day: "土曜",
    time: "17:30",
    currentEpisode: 7,
    totalEpisodes: 24,
    streaming: "Disney+",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 4,
    title: "葬送のフリーレン 第2期",
    day: "金曜",
    time: "23:30",
    currentEpisode: 6,
    totalEpisodes: 24,
    streaming: "Amazon",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 5,
    title: "Re:ゼロ 第3期",
    day: "日曜",
    time: "22:00",
    currentEpisode: 10,
    totalEpisodes: 25,
    streaming: "Amazon",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
];

// 来季（2026年春）
export const UPCOMING_SEASON: UpcomingAnime[] = [
  {
    id: 1,
    title: "ワンピース 新章",
    startDate: "2026年4月5日",
    broadcaster: "フジテレビ",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 2,
    title: "僕のヒーローアカデミア FINAL",
    startDate: "2026年4月12日",
    broadcaster: "MBS",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 3,
    title: "チェンソーマン 第2期",
    startDate: "2026年4月19日",
    broadcaster: "Netflix",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
  {
    id: 4,
    title: "鬼滅の刃 柱稽古編",
    startDate: "2026年4月26日",
    broadcaster: "フジテレビ",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
    streamingUrl: "https://example.com",
  },
];

// 新発表
export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: "HUNTER×HUNTER 再アニメ化決定",
    description: "2026年夏放送予定。新スタジオによる完全新作アニメとして再始動。",
    date: "2026年3月15日",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
  },
  {
    id: 2,
    title: "進撃の巨人 完全版",
    description: "劇場版3部作として2026年秋より公開予定。新規カットを大幅追加。",
    date: "2026年3月20日",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
  },
  {
    id: 3,
    title: "チェンソーマン 第2期 追加キャスト発表",
    description: "レゼ役に人気声優が決定。新PVも公開。",
    date: "2026年3月28日",
    officialUrl: "https://example.com",
    twitterUrl: "https://example.com",
  },
];

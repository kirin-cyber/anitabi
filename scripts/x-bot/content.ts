import type { PostLanguage, PostType } from "./slots.js";

const ANILIST_URL = "https://graphql.anilist.co";
const HASHTAGS_JP = "#アニメ #アニメ好きと繋がりたい #AniTabi";
const HASHTAGS_EN = "#anime #animelovers #AniTabi";
const JST_OFFSET = "+09:00";
const MAX_TWEET_LENGTH = 270;

interface AniListTitle {
  native: string | null;
  romaji: string | null;
  english: string | null;
}

interface AiringSchedule {
  airingAt: number;
  episode: number;
  media: {
    id: number;
    format: string | null;
    isAdult: boolean | null;
    countryOfOrigin: string | null; // 日本作品に絞るためのフィルタ用
    title: AniListTitle;
    coverImage: {
      large: string | null;
    };
  };
}

interface AiringScheduleData {
  Page: {
    airingSchedules: AiringSchedule[];
  };
}

interface TopAnime {
  id: number;
  title: AniListTitle;
  averageScore: number | null;
  genres: string[];
  coverImage: {
    large: string | null;
  };
}

interface TopAnimeData {
  Page: {
    media: TopAnime[];
  };
}

export interface GeneratedContent {
  type: PostType;
  text: string;
  imageUrl: string;
  animeId: number;
  title: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function requestAniList<T>(
  query: string,
  variables: Record<string, string | number>,
): Promise<T> {
  try {
    const response = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const responseBody: unknown = await response.json();

    if (!response.ok) {
      throw new Error(`AniList APIが ${response.status} を返しました`);
    }
    if (!isRecord(responseBody)) {
      throw new Error("AniList APIのレスポンス形式が不正です");
    }
    if (Array.isArray(responseBody.errors) && responseBody.errors.length > 0) {
      throw new Error(`AniList GraphQLエラー: ${JSON.stringify(responseBody.errors)}`);
    }
    if (!isRecord(responseBody.data)) {
      throw new Error("AniList APIのdataがありません");
    }

    return responseBody.data as T;
  } catch (error: unknown) {
    throw new Error(`AniList APIの取得に失敗しました: ${String(error)}`);
  }
}

function getTitle(title: AniListTitle, lang: PostLanguage = "jp"): string {
  if (lang === "en") {
    return title.english ?? title.romaji ?? title.native ?? "Unknown title";
  }

  return title.native ?? title.romaji ?? "タイトル不明";
}

function shorten(text: string, maxLength: number): string {
  const characters = Array.from(text);
  return characters.length <= maxLength
    ? text
    : `${characters.slice(0, maxLength - 1).join("")}…`;
}

function createWorkHashtag(title: string, lang: PostLanguage = "jp"): string {
  const normalized = Array.from(title.replace(/[^\p{L}\p{N}_]/gu, ""))
    .slice(0, 24)
    .join("");

  return `#${normalized || (lang === "en" ? "SeasonalAnime" : "今期アニメ")}`;
}

function formatJstTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(unixSeconds * 1000));
}

function getSeason(date: string): {
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  year: number;
} {
  const [yearText, monthText] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (month <= 3) return { season: "WINTER", year };
  if (month <= 6) return { season: "SPRING", year };
  if (month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

function hashDate(date: string): number {
  let hash = 0;

  for (const character of date) {
    hash = ((hash * 31) + (character.codePointAt(0) ?? 0)) >>> 0;
  }

  return hash;
}

async function fetchTodayAiring(date: string): Promise<AiringSchedule[]> {
  const start = Math.floor(new Date(`${date}T00:00:00${JST_OFFSET}`).getTime() / 1000);
  const end = start + (24 * 60 * 60);
  const query = `
    query($start: Int, $end: Int) {
      Page(page: 1, perPage: 50) {
        airingSchedules(
          airingAt_greater: $start
          airingAt_lesser: $end
          sort: TIME
        ) {
          airingAt
          episode
          media {
            id
            format
            isAdult
            countryOfOrigin
            title { native romaji english }
            coverImage { large }
          }
        }
      }
    }
  `;
  const data = await requestAniList<AiringScheduleData>(query, {
    start: start - 1,
    end,
  });

  return data.Page.airingSchedules.filter(
    (schedule) =>
      schedule.media.format === "TV" &&
      schedule.media.isAdult !== true &&
      schedule.media.countryOfOrigin === "JP", // 日本作品のみ（韓国・中国アニメの混入防止）
  );
}

async function fetchTopAnime(date: string): Promise<TopAnime[]> {
  const { season, year } = getSeason(date);
  const query = `
    query($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: 10) {
        media(
          season: $season
          seasonYear: $year
          type: ANIME
          format: TV
          sort: SCORE_DESC
          isAdult: false
          averageScore_greater: 60
        ) {
          id
          title { native romaji english }
          averageScore
          genres
          coverImage { large }
        }
      }
    }
  `;
  const data = await requestAniList<TopAnimeData>(query, { season, year });

  return data.Page.media;
}

function buildTypeAText(
  date: string,
  schedules: AiringSchedule[],
  lang: PostLanguage,
): string {
  const firstTitle = getTitle(schedules[0].media.title, lang);
  const [, month, day] = date.split("-");
  const header = lang === "en"
    ? [
      `📺 Today's Anime Broadcasts (${Number(month)}/${Number(day)})`,
      "So much to watch today—which one are you following?",
      "",
    ]
    : [
      `📺 今日の放送アニメ（${Number(month)}/${Number(day)}）`,
      "今日も気になる作品が多くて、どれを追うか迷う…！",
      "",
    ];
  // 本文にURLも誘導文も入れない（URL=$0.20課金回避／「プロフィールのリンクから」等のCTAはX側スパム判定で403になるため 2026-07-25）
  const footer = lang === "en"
    ? [
      "",
      `${HASHTAGS_EN} ${createWorkHashtag(firstTitle, lang)}`,
    ]
    : [
      "",
      `${HASHTAGS_JP} ${createWorkHashtag(firstTitle)}`,
    ];
  const scheduleLines = schedules.map((schedule) =>
    `${formatJstTime(schedule.airingAt)} ${
      shorten(getTitle(schedule.media.title, lang), lang === "en" ? 38 : 26)
    }`,
  );
  const selectedLines: string[] = [];

  for (const line of scheduleLines) {
    const nextLines = [...selectedLines, line];
    const omittedCount = scheduleLines.length - nextLines.length;
    const omittedLine = omittedCount > 0
      ? [lang === "en" ? `and ${omittedCount} more` : `ほか${omittedCount}作品`]
      : [];
    const candidate = [...header, ...nextLines, ...omittedLine, ...footer].join("\n");

    if (candidate.length > MAX_TWEET_LENGTH) {
      break;
    }
    selectedLines.push(line);
  }

  if (selectedLines.length === 0) {
    throw new Error("投稿文に放送作品を収められませんでした");
  }

  const omittedCount = scheduleLines.length - selectedLines.length;
  return [
    ...header,
    ...selectedLines,
    ...(omittedCount > 0
      ? [lang === "en" ? `and ${omittedCount} more` : `ほか${omittedCount}作品`]
      : []),
    ...footer,
  ].join("\n");
}

export async function generateTypeA(
  date: string,
  lang: PostLanguage = "jp",
): Promise<GeneratedContent> {
  try {
    const schedules = await fetchTodayAiring(date);

    if (schedules.length === 0) {
      throw new Error(`${date}に放送予定のTVアニメが見つかりません`);
    }

    const first = schedules[0].media;
    const imageUrl = first.coverImage.large;
    if (!imageUrl) {
      throw new Error("先頭作品のカバー画像がありません");
    }

    return {
      type: "A",
      text: buildTypeAText(date, schedules, lang),
      imageUrl,
      animeId: first.id,
      title: getTitle(first.title, lang),
    };
  } catch (error: unknown) {
    throw new Error(`型Aコンテンツの生成に失敗しました: ${String(error)}`);
  }
}

export async function generateTypeB(
  date: string,
  lang: PostLanguage = "jp",
): Promise<GeneratedContent> {
  try {
    const animeList = await fetchTopAnime(date);

    if (animeList.length === 0) {
      throw new Error("今期アニメが見つかりません");
    }

    const selected = animeList[hashDate(date) % animeList.length];
    const title = getTitle(selected.title, lang);
    const imageUrl = selected.coverImage.large;
    if (!imageUrl) {
      throw new Error(`${title}のカバー画像がありません`);
    }

    const genreText = selected.genres.slice(0, 2).join(lang === "en" ? " / " : "・");
    const scoreText = selected.averageScore ? `AniList ★${selected.averageScore}` : "";
    // 本文にURLも誘導文も入れない（URL=$0.20課金回避／「プロフィールのリンクから」等のCTAはX側スパム判定で403になるため 2026-07-25）
    const text = lang === "en"
      ? [
        "🌟 This Season's Pick",
        "",
        `"${shorten(title, 64)}"`,
        [genreText, scoreText].filter((value) => value.length > 0).join(" / "),
        "",
        "One I look forward to every week. Who else is watching?",
        "",
        `${HASHTAGS_EN} ${createWorkHashtag(title, lang)}`,
      ].join("\n")
      : [
        "🌟 今期の注目アニメ",
        "",
        `『${shorten(title, 48)}』`,
        [genreText, scoreText].filter((value) => value.length > 0).join(" / "),
        "",
        "毎週の続きが楽しみになる一本。気になっていた人と語りたい…！",
        "",
        `${HASHTAGS_JP} ${createWorkHashtag(title)}`,
      ].join("\n");

    if (text.length > MAX_TWEET_LENGTH) {
      throw new Error(`投稿文が長すぎます（${text.length}文字）`);
    }

    return {
      type: "B",
      text,
      imageUrl,
      animeId: selected.id,
      title,
    };
  } catch (error: unknown) {
    throw new Error(`型Bコンテンツの生成に失敗しました: ${String(error)}`);
  }
}

export async function generateContent(
  type: PostType,
  date: string,
  lang: PostLanguage = "jp",
): Promise<GeneratedContent> {
  try {
    return type === "A"
      ? await generateTypeA(date, lang)
      : await generateTypeB(date, lang);
  } catch (error: unknown) {
    throw new Error(`投稿コンテンツの生成に失敗しました: ${String(error)}`);
  }
}

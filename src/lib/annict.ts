const ANNICT_ENDPOINT = "https://api.annict.com/graphql";
const ANNICT_TOKEN = process.env.ANNICT_TOKEN;

// Annict GraphQL クエリ実行
async function query<T>(gql: string, variables?: Record<string, unknown>): Promise<T> {
  if (!ANNICT_TOKEN) {
    throw new Error("ANNICT_TOKEN is not set");
  }

  const res = await fetch(ANNICT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANNICT_TOKEN}`,
    },
    body: JSON.stringify({ query: gql, variables }),
    next: { revalidate: 3600 }, // 1時間キャッシュ
  });

  if (!res.ok) {
    throw new Error(`Annict API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Annict GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

// 型定義
export interface AnnictWork {
  annictId: number;
  title: string;
  media: string;
  seasonName: string | null;
  seasonYear: number | null;
  officialSiteUrl: string | null;
  twitterUsername: string | null;
  image: {
    recommendedImageUrl: string | null;
    facebookOgImageUrl: string | null;
  } | null;
  episodesCount: number;
}

interface SearchWorksResponse {
  searchWorks: {
    nodes: AnnictWork[];
  };
}

// シーズンアニメ一覧を取得
const SEARCH_WORKS_QUERY = `
  query SearchWorks($seasons: [String!], $first: Int) {
    searchWorks(seasons: $seasons, first: $first, orderBy: { field: WATCHERS_COUNT, direction: DESC }) {
      nodes {
        annictId
        title
        media
        seasonName
        seasonYear
        officialSiteUrl
        twitterUsername
        image {
          recommendedImageUrl
          facebookOgImageUrl
        }
        episodesCount
      }
    }
  }
`;

export async function getSeasonWorks(
  season: string,
  first: number = 30,
): Promise<AnnictWork[]> {
  try {
    const data = await query<SearchWorksResponse>(SEARCH_WORKS_QUERY, {
      seasons: [season],
      first,
    });
    return data.searchWorks.nodes;
  } catch (e) {
    console.error("Failed to fetch season works:", e);
    return [];
  }
}

export async function getScheduleWorks(
  season: string,
  first: number = 50,
): Promise<AnnictWork[]> {
  return getSeasonWorks(season, first);
}

// Wikipedia日本語APIでタイトルからあらすじを取得
export async function getAnimeDescriptionByTitle(title: string): Promise<string | null> {
  try {
    const wikiHeaders = { "User-Agent": "AniTabi/1.0 (https://anitabi.jp)" };

    const searchRes = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&format=json&srlimit=1`,
      { headers: wikiHeaders, cache: "no-store" }
    );
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const pageTitle: string | undefined = searchData.query?.search?.[0]?.title;
    if (!pageTitle) return null;

    const summaryRes = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
      { headers: wikiHeaders, cache: "no-store" }
    );
    if (!summaryRes.ok) return null;

    const summary = await summaryRes.json();
    return (summary.extract as string | undefined)?.trim() || null;
  } catch {
    return null;
  }
}

// 現在シーズンと来季シーズンを取得
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 1 && month <= 3) return `${year}-winter`;
  if (month >= 4 && month <= 6) return `${year}-spring`;
  if (month >= 7 && month <= 9) return `${year}-summer`;
  return `${year}-autumn`;
}

export function getNextSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 1 && month <= 3) return `${year}-spring`;
  if (month >= 4 && month <= 6) return `${year}-summer`;
  if (month >= 7 && month <= 9) return `${year}-autumn`;
  return `${year + 1}-winter`;
}

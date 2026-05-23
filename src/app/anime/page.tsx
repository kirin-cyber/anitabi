import type { Metadata } from "next";
import Header from "@/components/Header";
import AnimeFilter from "@/components/AnimeFilter";
import Breadcrumb from "@/components/Breadcrumb";
import { getAnimeByYear, getAnimeByYearRange, getAnimeBySeason } from "@/lib/anilist";
import type { Anime } from "@/types/anime";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "アニメ一覧 年代別・ジャンル別検索 - AniTabi",
  description: "1990年〜2026年のアニメを年代別・ジャンル別に検索。アクション・コメディ・恋愛など好みのジャンルで絞り込めます。",
  openGraph: {
    title: "アニメ一覧 年代別・ジャンル別検索 - AniTabi",
    description: "1990年〜2026年のアニメを年代別・ジャンル別に検索。アクション・コメディ・恋愛など好みのジャンルで絞り込めます。",
    url: "https://anitabi.site/anime",
    type: "website",
  },
};

const GENRE_MAP: Record<string, string> = {
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

function mapGenre(g: string): string {
  return GENRE_MAP[g] ?? g;
}

function genreColor(g: string): string {
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

const SEASON_LABEL: Record<string, string> = {
  WINTER: "冬",
  SPRING: "春",
  SUMMER: "夏",
  FALL: "秋",
};

type Props = {
  searchParams: Promise<{
    year?: string;
    yearFrom?: string;
    yearTo?: string;
    season?: string;
    page?: string;
  }>;
};

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;
  const yearFrom = params.yearFrom ? Number(params.yearFrom) : null;
  const yearTo = params.yearTo ? Number(params.yearTo) : null;
  const year = params.year ? Number(params.year) : null;
  const season = params.season as "WINTER" | "SPRING" | "SUMMER" | "FALL" | undefined;
  const page = Number(params.page ?? 1);

  // 年代ラベル
  let yearLabel: string;
  let yearKey: string; // フィルターのアクティブ判定用

  let animeList: Anime[] = [];
  try {
    if (year && season) {
      const works = await getAnimeBySeason(year, season, page);
      animeList = works.map(toAnime);
      yearLabel = `${year}年 ${SEASON_LABEL[season]}アニメ`;
      yearKey = `${year}`;
    } else if (yearFrom && yearTo) {
      const works = await getAnimeByYearRange(yearFrom, yearTo, page);
      animeList = works.map(toAnime);
      yearLabel = `${yearFrom}〜${yearTo}年`;
      yearKey = `${yearFrom}-${yearTo}`;
    } else if (year) {
      const works = await getAnimeByYear(year, page);
      animeList = works.map(toAnime);
      yearLabel = `${year}年`;
      yearKey = `${year}`;
    } else {
      // デフォルト: 全年代（人気順で2020〜2026）
      const works = await getAnimeByYearRange(2020, 2026, page);
      animeList = works.map(toAnime);
      yearLabel = "全年代";
      yearKey = "all";
    }
  } catch (e) {
    console.error("Failed to fetch AniList data:", e);
    yearLabel = "取得エラー";
    yearKey = "all";
  }

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-8">
          <Breadcrumb items={[{ label: "アニメ一覧", href: "/anime" }]} />
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">アニメ一覧</h1>
            <p className="mt-1 text-sm text-text-sub">
              {yearLabel}のTVアニメを人気順で表示
            </p>
          </div>

          <AnimeFilter
            animeList={animeList}
            activeYearKey={yearKey}
            activeSeason={season ?? null}
            currentPage={page}
          />
        </section>
      </main>

      <footer className="border-t border-text-sub/20 bg-background-secondary/50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-6 text-center text-xs text-text-sub">
          <p>
            &copy; 2026{" "}
            <span className="font-bold text-text-main">AniTabi</span> by kirin
          </p>
        </div>
      </footer>
    </>
  );

  function toAnime(w: { id: number; title: { native: string | null; romaji?: string | null; english?: string | null }; coverImage: { large: string | null } | null; genres: string[]; episodes: number | null; averageScore: number | null; seasonYear: number | null }): Anime {
    const genres = w.genres.map(mapGenre);
    return {
      id: w.id,
      title: w.title.native ?? `ID:${w.id}`,
      titleEn: w.title.romaji ?? w.title.english ?? "",
      image: w.coverImage?.large ?? "",
      genre: genres,
      genreColor: genreColor(genres[0] ?? ""),
      episodes: w.episodes ?? 0,
      score: w.averageScore ?? 0,
      description: "",
      streaming: [],
      season: w.seasonYear ? `${w.seasonYear}年` : "",
    };
  }
}

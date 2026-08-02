import type { Metadata } from "next";
import Header from "@/components/Header";
import RankingTabs from "@/components/RankingTabs";
import Breadcrumb from "@/components/Breadcrumb";
import SeasonNav from "@/components/SeasonNav";
import { getRankingAnime } from "@/lib/anilist";
import { getServerLocale, getT } from "@/lib/locale";
import {
  type SeasonInfo,
  getCurrentSeasonInfo,
  parseSeasonQuery,
  formatSeasonAnimeLabel,
} from "@/lib/season";

type Props = {
  searchParams: Promise<{ year?: string; season?: string }>;
};

// URLクエリ（year, season）から表示対象のクールを決定。指定がなければ現在のクール
async function resolveSeasonInfo(searchParams: Props["searchParams"]): Promise<SeasonInfo> {
  const params = await searchParams;
  return parseSeasonQuery(params.year, params.season) ?? getCurrentSeasonInfo();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const seasonInfo = await resolveSeasonInfo(searchParams);
  const seasonLabel = formatSeasonAnimeLabel(seasonInfo, "ja");
  const title = `アニメランキング ${seasonLabel} 人気TOP10 - AniTabi`;
  const description = `${seasonLabel}の人気ランキング・歴代高評価TOP10・注目作品をまとめてチェック。`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://anitabi.site/ranking",
      type: "website",
    },
  };
}

export default async function RankingPage({ searchParams }: Props) {
  const locale = await getServerLocale();
  const t = getT(locale);
  const seasonInfo = await resolveSeasonInfo(searchParams);
  const seasonAnimeLabel = formatSeasonAnimeLabel(seasonInfo, locale);

  const [popular, topRated, trending] = await Promise.all([
    getRankingAnime(["POPULARITY_DESC"], { season: seasonInfo.season, year: seasonInfo.year, perPage: 10 }),
    getRankingAnime(["SCORE_DESC"], { perPage: 10 }),
    getRankingAnime(["TRENDING_DESC"], { season: seasonInfo.season, year: seasonInfo.year, perPage: 10 }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Breadcrumb items={[{ label: "ランキング", href: "/ranking" }]} />
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
              🏆 {seasonAnimeLabel} {locale === "en" ? "Rankings" : "ランキング"}
            </h1>
            <p className="mt-1 text-sm text-text-sub">
              {locale === "en" ? "Top anime by popularity, score, and trending" : "人気・評価・トレンドで見るアニメランキング"}
            </p>
            <div className="mt-4">
              <SeasonNav current={seasonInfo} basePath="/ranking" />
            </div>
          </div>
          <RankingTabs popular={popular} topRated={topRated} trending={trending} />
        </div>
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
}

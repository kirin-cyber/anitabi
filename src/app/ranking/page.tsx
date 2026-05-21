import type { Metadata } from "next";
import Header from "@/components/Header";
import RankingTabs from "@/components/RankingTabs";
import { getRankingAnime } from "@/lib/anilist";

export const metadata: Metadata = {
  title: "アニメランキング 2026年春 人気TOP10 - AniTabi",
  description: "2026年春アニメの人気ランキング・歴代高評価TOP10・注目作品をまとめてチェック。",
  openGraph: {
    title: "アニメランキング 2026年春 人気TOP10 - AniTabi",
    description: "2026年春アニメの人気ランキング・歴代高評価TOP10・注目作品をまとめてチェック。",
    url: "https://anitabi.site/ranking",
    type: "website",
  },
};

function getCurrentAniListSeason(): {
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  year: number;
} {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month <= 3) return { season: "WINTER", year };
  if (month <= 6) return { season: "SPRING", year };
  if (month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export default async function RankingPage() {
  const { season, year } = getCurrentAniListSeason();

  const [popular, topRated, trending] = await Promise.all([
    getRankingAnime(["POPULARITY_DESC"], { season, year, perPage: 10 }),
    getRankingAnime(["SCORE_DESC"], { perPage: 10 }),
    getRankingAnime(["TRENDING_DESC"], { season, year, perPage: 10 }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
              🏆 ランキング
            </h1>
            <p className="mt-1 text-sm text-text-sub">
              人気・評価・トレンドで見るアニメランキング
            </p>
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

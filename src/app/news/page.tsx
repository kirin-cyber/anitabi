import type { Metadata } from "next";
import Header from "@/components/Header";
import NewsTabs from "@/components/NewsTabs";
import { getSeasonWorks, getCurrentSeason, getNextSeason } from "@/lib/annict";
import { toNewsWork } from "@/lib/annict-helpers";
import {
  CURRENT_SEASON as DUMMY_CURRENT,
  UPCOMING_SEASON as DUMMY_UPCOMING,
  NEWS_ITEMS,
} from "@/constants/news";

export const metadata: Metadata = {
  title: "最新情報 - AniTabi",
  description: "今季・来季のアニメ情報や新発表をチェック。放送スケジュール・配信リンクもまとめて確認。",
};

export default async function NewsPage() {
  // Annict APIからリアルデータ取得
  let currentWorks;
  let upcomingWorks;

  try {
    const [current, upcoming] = await Promise.all([
      getSeasonWorks(getCurrentSeason(), 20),
      getSeasonWorks(getNextSeason(), 20),
    ]);
    currentWorks = current.length > 0 ? current.map(toNewsWork) : null;
    upcomingWorks = upcoming.length > 0 ? upcoming.map(toNewsWork) : null;
  } catch {
    currentWorks = null;
    upcomingWorks = null;
  }

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">最新情報</h1>
            <p className="mt-1 text-sm text-text-sub">
              今季・来季のアニメ情報をまとめてチェック
            </p>
          </div>

          <NewsTabs
            currentWorks={currentWorks}
            upcomingWorks={upcomingWorks}
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
}

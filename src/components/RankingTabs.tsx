"use client";

import { useState } from "react";
import Link from "next/link";
import AnimeImage from "@/components/AnimeImage";
import type { AniListRankingAnime } from "@/lib/anilist";
import { useLanguage } from "@/contexts/LanguageContext";

type Tab = "popular" | "topRated" | "trending";

const BADGE_COLORS = [
  "bg-yellow-500",
  "bg-gray-400",
  "bg-amber-700",
];

interface Props {
  popular: AniListRankingAnime[];
  topRated: AniListRankingAnime[];
  trending: AniListRankingAnime[];
}

export default function RankingTabs({ popular, topRated, trending }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("popular");
  const { t } = useLanguage();

  const TABS: { id: Tab; labelKey: string }[] = [
    { id: "popular", labelKey: "popular" },
    { id: "topRated", labelKey: "topRated" },
    { id: "trending", labelKey: "trending" },
  ];

  const dataMap: Record<Tab, AniListRankingAnime[]> = { popular, topRated, trending };
  const items = dataMap[activeTab];

  return (
    <>
      {/* タブ */}
      <div className="mb-6 flex rounded-xl border border-text-sub/15 bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-accent text-white"
                : "text-text-sub hover:text-text-main"
            }`}
          >
            {t("ranking", tab.labelKey)}
          </button>
        ))}
      </div>

      {/* ランキングリスト */}
      <div className="flex flex-col gap-3">
        {items.map((anime, i) => {
          const title = anime.title.native ?? anime.title.romaji ?? "";
          const badgeClass = BADGE_COLORS[i] ?? "bg-background-secondary text-text-sub";

          return (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="group flex items-center gap-4 overflow-hidden rounded-xl border border-text-sub/15 bg-card px-4 py-3 transition-colors hover:border-accent/50"
            >
              {/* 順位バッジ */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  i < 3 ? badgeClass : "bg-background-secondary text-text-sub"
                }`}
              >
                {i + 1}
              </div>

              {/* サムネイル */}
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-background">
                <AnimeImage
                  src={anime.coverImage?.large ?? ""}
                  alt={title}
                  className="h-full w-full"
                />
              </div>

              {/* 情報 */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-text-main transition-colors group-hover:text-accent">
                  {title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-sub">
                  {anime.seasonYear && <span>{anime.seasonYear}年</span>}
                  {anime.episodes && <span>{anime.episodes}{t("ranking", "episodes")}</span>}
                  {anime.averageScore && (
                    <span className="font-bold text-accent">★ {anime.averageScore}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-xl border border-text-sub/15 bg-card px-6 py-12 text-center text-text-sub">
            {t("schedule", "noData")}
          </div>
        )}
      </div>
    </>
  );
}

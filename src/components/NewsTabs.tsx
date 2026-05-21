"use client";

import { useState } from "react";
import Carousel from "@/components/Carousel";
import AnimeImage from "@/components/AnimeImage";
import {
  CURRENT_SEASON,
  UPCOMING_SEASON,
  NEWS_ITEMS,
} from "@/constants/news";
import { useLanguage } from "@/contexts/LanguageContext";

const TABS = ["今季", "来季", "新発表"] as const;
type Tab = (typeof TABS)[number];
const TAB_KEYS: Record<Tab, string> = {
  "今季": "current",
  "来季": "upcoming",
  "新発表": "newAnnouncement",
};

// Annict APIから渡されるリアルデータ型
interface AnnictNewsWork {
  id: number;
  title: string;
  episodes: number;
  media: string;
  officialUrl: string;
  twitterUrl: string;
  image: string;
}

interface Props {
  currentWorks?: AnnictNewsWork[] | null;
  upcomingWorks?: AnnictNewsWork[] | null;
}

function LinkButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-text-sub/20 px-3 py-1.5 text-xs text-text-sub transition-colors hover:border-accent hover:text-accent"
    >
      <span>{icon}</span>
      {label}
    </a>
  );
}

export default function NewsTabs({ currentWorks, upcomingWorks }: Props) {
  const [tab, setTab] = useState<Tab>("今季");
  const { t } = useLanguage();

  const hasRealCurrent = currentWorks && currentWorks.length > 0;
  const hasRealUpcoming = upcomingWorks && upcomingWorks.length > 0;

  return (
    <>
      {/* タブ切り替え */}
      <div className="mb-6 flex gap-1 rounded-xl bg-background-secondary p-1">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              tab === tabKey
                ? "bg-accent text-white"
                : "text-text-sub hover:text-text-main"
            }`}
          >
            {t("news", TAB_KEYS[tabKey])}
          </button>
        ))}
      </div>

      {/* ========== 今季 ========== */}
      {tab === "今季" && (
        <Carousel>
          {hasRealCurrent
            ? currentWorks.map((work) => (
                <article
                  key={work.id}
                  className="w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card md:w-[320px]"
                >
                  {work.image && (
                    <div className="h-36 overflow-hidden bg-background">
                      <AnimeImage
                        src={work.image}
                        alt={work.title}
                        className="h-full w-full"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                        </span>
                        {t("news", "broadcasting")}
                      </span>
                      <span className="rounded bg-background-secondary px-2 py-0.5 text-[10px] text-text-sub">
                        {work.media}
                      </span>
                      {work.episodes > 0 && (
                        <span className="text-xs text-text-sub">
                          全{work.episodes}話
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-text-main">
                      {work.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <LinkButton href={work.officialUrl} label="公式サイト" icon="🔗" />
                      <LinkButton href={work.twitterUrl} label="X公式" icon="𝕏" />
                    </div>
                  </div>
                </article>
              ))
            : CURRENT_SEASON.map((anime) => {
                const progress = Math.round(
                  (anime.currentEpisode / anime.totalEpisodes) * 100,
                );
                return (
                  <article
                    key={anime.id}
                    className="w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card md:w-[320px]"
                  >
                    <div className="p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                          </span>
                          {t("news", "broadcasting")}
                        </span>
                        <span className="text-xs text-text-sub">
                          毎週{anime.day} {anime.time}
                        </span>
                        <span className="rounded bg-background-secondary px-2 py-0.5 text-[10px] text-text-sub">
                          {anime.streaming}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-text-main">
                        {anime.title}
                      </h3>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-text-sub">進捗</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-accent">
                          {anime.currentEpisode}/{anime.totalEpisodes}話
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <LinkButton href={anime.officialUrl} label="公式サイト" icon="🔗" />
                        <LinkButton href={anime.streamingUrl} label="配信を見る" icon="▶️" />
                        <LinkButton href={anime.twitterUrl} label="X公式" icon="𝕏" />
                      </div>
                    </div>
                  </article>
                );
              })}
        </Carousel>
      )}

      {/* ========== 来季 ========== */}
      {tab === "来季" && (
        <Carousel>
          {hasRealUpcoming
            ? upcomingWorks.map((work) => (
                <article
                  key={work.id}
                  className="w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card md:w-[320px]"
                >
                  {work.image && (
                    <div className="h-36 overflow-hidden bg-background">
                      <AnimeImage
                        src={work.image}
                        alt={work.title}
                        className="h-full w-full"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-400">
                        {t("news", "newShow")}
                      </span>
                      <span className="rounded bg-background-secondary px-2 py-0.5 text-[10px] text-text-sub">
                        {work.media}
                      </span>
                      {work.episodes > 0 && (
                        <span className="text-xs text-text-sub">
                          全{work.episodes}話
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-text-main">
                      {work.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <LinkButton href={work.officialUrl} label="公式サイト" icon="🔗" />
                      <LinkButton href={work.twitterUrl} label="X公式" icon="𝕏" />
                    </div>
                  </div>
                </article>
              ))
            : UPCOMING_SEASON.map((anime) => (
                <article
                  key={anime.id}
                  className="w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card md:w-[320px]"
                >
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-400">
                        {t("news", "newShow")}
                      </span>
                      <span className="text-xs text-text-sub">
                        {anime.startDate} 開始
                      </span>
                      <span className="rounded bg-background-secondary px-2 py-0.5 text-[10px] text-text-sub">
                        {anime.broadcaster}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-main">
                      {anime.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <LinkButton href={anime.officialUrl} label="公式サイト" icon="🔗" />
                      <LinkButton href={anime.streamingUrl} label="配信を見る" icon="▶️" />
                      <LinkButton href={anime.twitterUrl} label="X公式" icon="𝕏" />
                    </div>
                  </div>
                </article>
              ))}
        </Carousel>
      )}

      {/* ========== 新発表 ========== */}
      {tab === "新発表" && (
        <Carousel>
          {NEWS_ITEMS.map((item) => (
            <article
              key={item.id}
              className="w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card md:w-[320px]"
            >
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                    NEW
                  </span>
                  <span className="text-xs text-text-sub">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-text-main">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-sub">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <LinkButton href={item.officialUrl} label="公式サイト" icon="🔗" />
                  <LinkButton href={item.twitterUrl} label="X公式" icon="𝕏" />
                </div>
              </div>
            </article>
          ))}
        </Carousel>
      )}

      {/* 注記 */}
      <p className="mt-8 text-center text-xs text-text-sub">
        ※データはAnnict APIから自動取得されています
      </p>
    </>
  );
}

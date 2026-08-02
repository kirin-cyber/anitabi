"use client";

import Link from "next/link";
import Telop from "./Telop";
import Carousel from "./Carousel";
import AnimeImage from "./AnimeImage";
import SeasonNav from "./SeasonNav";
import { GENRES } from "@/constants/genres";
import { useLanguage } from "@/contexts/LanguageContext";
import { type SeasonInfo, formatSeasonAnimeLabel } from "@/lib/season";
import type { Anime } from "@/types/anime";

type Props = {
  animeList: Anime[];
  allAnimeList: Anime[];
  seasonInfo: SeasonInfo;
};

export default function HomeContent({ animeList, allAnimeList, seasonInfo }: Props) {
  const { t, locale } = useLanguage();
  const seasonAnimeLabel = formatSeasonAnimeLabel(seasonInfo, locale);
  // クール軸を前面に出した見出し（「2026年夏アニメ」を主役にする）
  const featuredTitle =
    locale === "ja" ? `🔥 ${seasonAnimeLabel}の注目作品` : `🔥 Featured ${seasonAnimeLabel}`;
  const gridTitle = locale === "ja" ? `${seasonAnimeLabel} 一覧` : `${seasonAnimeLabel} List`;

  // ジャンルラベル翻訳
  const GENRE_EN: Record<string, string> = {
    "アクション": "Action",
    "ファンタジー": "Fantasy",
    "コメディ": "Comedy",
    "恋愛": "Romance",
    "SF": "Sci-Fi",
    "スポーツ": "Sports",
    "ホラー": "Horror",
    "日常": "Slice of Life",
    "ドラマ": "Drama",
    "ミステリー": "Mystery",
  };
  const genreLabel = (label: string) =>
    locale === "ja" ? label : (GENRE_EN[label] ?? label);

  // タイトル表示（EN時はtitleEn優先）
  const displayTitle = (anime: Anime) =>
    locale === "en" && anime.titleEn ? anime.titleEn : anime.title;

  // メディア種別ラベル翻訳
  const mediaLabel = (label: string) => {
    if (locale === "ja") return label;
    const map: Record<string, string> = {
      "TVアニメ": "TV Anime", "OVA": "OVA", "劇場版": "Movie", "Web": "Web",
    };
    return map[label] ?? label;
  };

  // 話数表示
  const epsLabel = (n: number) => locale === "ja" ? `全${n}話` : `${n} eps`;

  // シーズン表示
  const seasonLabel = (s: string) => {
    if (locale === "ja") return s;
    return s
      .replace(/(\d+)春/, "$1 Spring")
      .replace(/(\d+)夏/, "$1 Summer")
      .replace(/(\d+)秋/, "$1 Fall")
      .replace(/(\d+)冬/, "$1 Winter");
  };

  return (
    <>
      <Telop titles={animeList.map((a) => a.title)} />

      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="relative mx-auto max-w-6xl overflow-hidden px-4 py-16 text-center md:py-24">
          {/* 背景装飾パーティクル */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {([
              { top: "12%", left: "6%",  s: 4, d: "0s" },
              { top: "22%", right: "10%", s: 6, d: "0.7s" },
              { top: "65%", left: "4%",  s: 4, d: "1.2s" },
              { top: "45%", right: "5%",  s: 4, d: "0.4s" },
              { top: "75%", left: "22%", s: 8, d: "1.8s" },
              { top: "18%", left: "38%", s: 4, d: "2.2s" },
              { top: "82%", right: "28%", s: 6, d: "0.9s" },
              { top: "8%",  right: "42%", s: 4, d: "1.5s" },
              { top: "55%", left: "14%", s: 4, d: "2.8s" },
              { top: "35%", right: "20%", s: 6, d: "1.1s" },
            ] as { top?: string; left?: string; right?: string; s: number; d: string }[]).map((p, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-accent/50"
                style={{
                  top: p.top, left: p.left, right: p.right,
                  width: p.s, height: p.s,
                  animation: `floatStar 3.5s ease-in-out ${p.d} infinite`,
                }}
              />
            ))}
          </div>

          {/* 現在のクールを明示するバッジ */}
          <span
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent"
            style={{ animation: "fadeInUp 0.6s ease-out 0s both" }}
          >
            🎬 {seasonAnimeLabel}
          </span>

          <h1
            className="text-3xl font-bold leading-tight md:text-5xl"
            style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
          >
            {t("home", "tagline1")}
            <br />
            <span className="text-accent">{t("home", "tagline2")}</span>
          </h1>
          <p
            className="mx-auto mt-4 max-w-lg text-text-sub md:text-lg"
            style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
          >
            {t("home", "subtitle")}
          </p>
          <div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            style={{ animation: "fadeInUp 0.6s ease-out 0.5s both" }}
          >
            {/* 診断ボタン（パルスリング付き） */}
            <div className="relative inline-flex">
              <span
                className="absolute inset-0 rounded-full bg-accent"
                aria-hidden="true"
                style={{ animation: "pulseRing 2s ease-out 1s infinite" }}
              />
              <Link
                href="/diagnosis"
                className="relative inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white transition-opacity hover:opacity-90"
              >
                {t("home", "diagnosisBtn")}
              </Link>
            </div>
            <Link
              href="/anime"
              className="inline-flex h-12 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              {t("home", "animeListBtn")}
            </Link>
          </div>

          {/* クール切り替え導線（前クール/次クール/季節選択） */}
          <div className="mt-6" style={{ animation: "fadeInUp 0.6s ease-out 0.6s both" }}>
            <SeasonNav current={seasonInfo} basePath="/" />
          </div>
        </section>

        {/* ジャンルタグ */}
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-4 text-lg font-bold md:text-xl">
            {t("home", "genreTitle")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Link
                key={genre.label}
                href={`/anime?genre=${encodeURIComponent(genre.label)}`}
                className={`${genre.color} rounded-full px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80`}
              >
                {genreLabel(genre.label)}
              </Link>
            ))}
          </div>
        </section>

        {/* 今季注目作品カルーセル */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-6 text-lg font-bold md:text-xl">
            {featuredTitle}
          </h2>
          <Carousel>
            {animeList.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/search?title=${encodeURIComponent(anime.title)}`}
                className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-all duration-300 hover:border-accent/50 hover:scale-[1.02] hover:shadow-lg md:w-[320px]"
              >
                <div className="aspect-video overflow-hidden bg-background">
                  <AnimeImage src={anime.image} alt={anime.title} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`${anime.genreColor} rounded-full px-2.5 py-0.5 text-xs font-medium text-white`}>
                      {mediaLabel(anime.genre[0])}
                    </span>
                    {anime.episodes > 0 && (
                      <span className="text-xs text-text-sub">{epsLabel(anime.episodes)}</span>
                    )}
                  </div>
                  <h3 className="font-bold leading-snug text-text-main transition-colors group-hover:text-accent">{displayTitle(anime)}</h3>
                  {anime.season && (
                    <p className="mt-1 text-xs text-text-sub">{seasonLabel(anime.season)}</p>
                  )}
                </div>
              </Link>
            ))}
          </Carousel>
        </section>

        {/* 今季全作品グリッド */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold md:text-xl">{gridTitle}</h2>
            <span className="text-sm text-text-sub">
              {allAnimeList.length} {t("home", "countUnit")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allAnimeList.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/search?title=${encodeURIComponent(anime.title)}`}
                className="group flex items-start gap-3 overflow-hidden rounded-xl border border-text-sub/15 bg-card p-3 transition-all duration-300 hover:border-accent/50 hover:scale-[1.01] hover:shadow-md"
              >
                <div className="w-14 shrink-0 overflow-hidden rounded-lg bg-background" style={{ aspectRatio: "2/3" }}>
                  <AnimeImage src={anime.image} alt={anime.title} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`${anime.genreColor} inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white mb-1`}>
                    {mediaLabel(anime.genre[0])}
                  </span>
                  <h3 className="text-sm font-bold leading-snug text-text-main group-hover:text-accent transition-colors line-clamp-2">
                    {displayTitle(anime)}
                  </h3>
                  {anime.episodes > 0 && (
                    <p className="mt-1 text-xs text-text-sub">{epsLabel(anime.episodes)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/anime"
              className="inline-flex h-11 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              {t("home", "moreBtn")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-text-sub/20 bg-background-secondary/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-text-sub md:flex-row md:justify-between md:text-left">
          <p>
            &copy; 2026{" "}
            <span className="font-bold text-text-main">AniTabi</span> by kirin
          </p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="transition-colors hover:text-text-main">{t("footer", "privacy")}</Link>
            <Link href="/disclaimer" className="transition-colors hover:text-text-main">{t("footer", "disclaimer")}</Link>
            <Link href="/contact" className="transition-colors hover:text-text-main">{t("footer", "contact")}</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

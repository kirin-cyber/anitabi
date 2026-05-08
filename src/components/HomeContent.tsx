"use client";

import Link from "next/link";
import Telop from "./Telop";
import Carousel from "./Carousel";
import AnimeImage from "./AnimeImage";
import { GENRES } from "@/constants/genres";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Anime } from "@/types/anime";

type Props = {
  animeList: Anime[];
  allAnimeList: Anime[];
};

export default function HomeContent({ animeList, allAnimeList }: Props) {
  const { t, locale } = useLanguage();

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
        <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {t("home", "tagline1")}
            <br />
            <span className="text-accent">{t("home", "tagline2")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-text-sub md:text-lg">
            {t("home", "subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/diagnosis"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white transition-opacity hover:opacity-90"
            >
              {t("home", "diagnosisBtn")}
            </Link>
            <Link
              href="/anime"
              className="inline-flex h-12 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              {t("home", "animeListBtn")}
            </Link>
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
            {t("home", "featuredTitle")}
          </h2>
          <Carousel>
            {animeList.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/search?title=${encodeURIComponent(anime.title)}`}
                className="w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50 md:w-[320px]"
              >
                <div className="h-40 overflow-hidden bg-background">
                  <AnimeImage src={anime.image} alt={anime.title} className="h-full w-full" />
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
                  <h3 className="font-bold leading-snug text-text-main">{displayTitle(anime)}</h3>
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
            <h2 className="text-lg font-bold md:text-xl">{t("home", "gridTitle")}</h2>
            <span className="text-sm text-text-sub">
              {allAnimeList.length} {t("home", "countUnit")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allAnimeList.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/search?title=${encodeURIComponent(anime.title)}`}
                className="group flex items-start gap-3 overflow-hidden rounded-xl border border-text-sub/15 bg-card p-3 transition-colors hover:border-accent/50"
              >
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-background">
                  <AnimeImage src={anime.image} alt={anime.title} className="h-full w-full" />
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

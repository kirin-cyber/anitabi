"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimeImage from "@/components/AnimeImage";
import { GENRES } from "@/constants/genres";
import type { Anime } from "@/types/anime";

const EPISODE_FILTERS = [
  { label: "すべて", min: 0, max: 9999 },
  { label: "〜13話", min: 0, max: 13 },
  { label: "14〜26話", min: 14, max: 26 },
  { label: "27話〜", min: 27, max: 9999 },
] as const;

const SCORE_FILTERS = [
  { label: "すべて", min: 0 },
  { label: "70+", min: 70 },
  { label: "80+", min: 80 },
] as const;

const SEASON_OPTIONS = [
  { label: "全シーズン", key: "" },
  { label: "冬（1〜3月）", key: "WINTER" },
  { label: "春（4〜6月）", key: "SPRING" },
  { label: "夏（7〜9月）", key: "SUMMER" },
  { label: "秋（10〜12月）", key: "FALL" },
] as const;

const selectClass =
  "appearance-none rounded-lg border border-text-sub/20 bg-card px-4 py-2 pr-8 text-sm text-text-main outline-none transition-colors focus:border-accent/60 hover:border-accent/40 cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%237a90bc%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat";

interface Props {
  animeList: Anime[];
  activeYearKey: string;
  activeSeason: string | null;
  currentPage: number;
}

export default function AnimeFilter({
  animeList,
  activeYearKey,
  activeSeason,
  currentPage,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [episodeFilter, setEpisodeFilter] = useState(0);
  const [scoreFilter, setScoreFilter] = useState(0);

  const handleYearChange = (year: string) => {
    if (year === "all") {
      router.push("/anime");
    } else {
      router.push(`/anime?year=${year}`);
    }
  };

  const handleSeasonChange = (season: string) => {
    if (season) {
      router.push(`/anime?year=${activeYearKey}&season=${season}`);
    } else {
      router.push(`/anime?year=${activeYearKey}`);
    }
  };

  const filtered = useMemo(() => {
    return animeList.filter((anime) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !anime.title.toLowerCase().includes(q) &&
          !anime.titleEn.toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedGenre && !anime.genre.includes(selectedGenre)) return false;
      const ep = EPISODE_FILTERS[episodeFilter];
      if (anime.episodes < ep.min || anime.episodes > ep.max) return false;
      if (anime.score < SCORE_FILTERS[scoreFilter].min) return false;
      return true;
    });
  }, [animeList, search, selectedGenre, episodeFilter, scoreFilter]);

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    animeList.forEach((a) => a.genre.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [animeList]);

  // ページネーションURL構築
  let baseHref = activeYearKey === "all" ? "/anime" : `/anime?year=${activeYearKey}`;
  if (activeSeason) {
    baseHref += `&season=${activeSeason}`;
  }
  const separator = baseHref.includes("?") ? "&" : "?";

  return (
    <>
      {/* 年代・季節フィルター */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold text-text-sub">年代・シーズン</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={activeYearKey}
            onChange={(e) => handleYearChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">全年代</option>
            {Array.from({ length: 2026 - 1990 + 1 }, (_, i) => {
              const y = 1990 + i;
              return (
                <option key={y} value={y}>
                  {y}年
                </option>
              );
            })}
          </select>

          {activeYearKey !== "all" && (
            <select
              value={activeSeason ?? ""}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className={selectClass}
            >
              {SEASON_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <div className="flex items-center gap-3 rounded-xl border-2 border-text-sub/15 bg-card px-4 py-3 focus-within:border-accent/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5 shrink-0 text-text-sub"
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="タイトルで絞り込み..."
            className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-sub/50 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-text-sub hover:text-text-main"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* フィルターセクション */}
      <div className="mb-8 space-y-4">
        <div>
          <p className="mb-2 text-xs font-bold text-text-sub">ジャンル</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedGenre === null
                  ? "bg-accent text-white"
                  : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
              }`}
            >
              すべて
            </button>
            {availableGenres.map((g) => {
              const genreData = GENRES.find((gd) => gd.label === g);
              return (
                <button
                  key={g}
                  onClick={() =>
                    setSelectedGenre(selectedGenre === g ? null : g)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedGenre === g
                      ? `${genreData?.color ?? "bg-accent"} text-white`
                      : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <p className="mb-2 text-xs font-bold text-text-sub">話数</p>
            <div className="flex gap-2">
              {EPISODE_FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setEpisodeFilter(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    episodeFilter === i
                      ? "bg-accent text-white"
                      : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-text-sub">評価</p>
            <div className="flex gap-2">
              {SCORE_FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setScoreFilter(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    scoreFilter === i
                      ? "bg-accent text-white"
                      : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-text-sub">
        {filtered.length}件の作品が見つかりました
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((anime) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="group overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-all duration-300 hover:border-accent/50 hover:scale-[1.01] hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden bg-background">
                <AnimeImage
                  src={anime.image}
                  alt={anime.title}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
                {anime.score > 0 && (
                  <span className="absolute right-2 top-2 rounded-lg bg-background/80 px-2 py-0.5 text-xs font-bold text-accent backdrop-blur-sm">
                    ★ {anime.score}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {anime.genre.slice(0, 3).map((g) => {
                    const genreData = GENRES.find((gd) => gd.label === g);
                    return (
                      <span
                        key={g}
                        className={`${genreData?.color ?? "bg-gray-500"} rounded-full px-2 py-0.5 text-[10px] font-medium text-white`}
                      >
                        {g}
                      </span>
                    );
                  })}
                  {anime.episodes > 0 && (
                    <span className="ml-auto text-xs text-text-sub">
                      全{anime.episodes}話
                    </span>
                  )}
                </div>
                <h3 className="font-bold leading-snug text-text-main group-hover:text-accent transition-colors">
                  {anime.title}
                </h3>
                {anime.season && (
                  <p className="mt-1 text-xs text-text-sub">{anime.season}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 text-text-sub">
            条件に一致する作品が見つかりませんでした
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedGenre(null);
              setEpisodeFilter(0);
              setScoreFilter(0);
            }}
            className="mt-4 text-sm text-accent hover:underline"
          >
            フィルターをリセット
          </button>
        </div>
      )}

      {/* ページネーション */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {currentPage > 1 ? (
          <Link
            href={`${baseHref}${separator}page=${currentPage - 1}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            ← 前へ
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/10 px-6 text-sm text-text-sub/30">
            ← 前へ
          </span>
        )}
        <span className="text-sm text-text-sub">ページ {currentPage}</span>
        {animeList.length >= 50 ? (
          <Link
            href={`${baseHref}${separator}page=${currentPage + 1}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            次へ →
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/10 px-6 text-sm text-text-sub/30">
            次へ →
          </span>
        )}
      </div>
    </>
  );
}

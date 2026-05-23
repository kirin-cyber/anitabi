"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnimeImage from "@/components/AnimeImage";
import { GENRES } from "@/constants/genres";
import type { Anime } from "@/types/anime";
import { toRomaji, toHiragana } from "wanakana";
import { useLanguage } from "@/contexts/LanguageContext";

// テキスト正規化（カタカナ→ひらがな、スペース除去、小文字化）
function normalizeText(str: string): string {
  if (!str) return "";
  return toHiragana(str.toLowerCase()).replace(/[\s　・]/g, "");
}

// ひらがな・カタカナを含むか判定
const KANA_REGEX = /[぀-ゟ゠-ヿ]/;

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
  const { t, locale } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [episodeFilter, setEpisodeFilter] = useState(0);
  const [scoreFilter, setScoreFilter] = useState(0);
  const [isPending, startTransition] = useTransition();

  const EP_LABELS = [
    t("anime", "episodesAll"),
    t("anime", "episodes13"),
    t("anime", "episodes14to26"),
    t("anime", "episodes27plus"),
  ];
  const SEASON_LABELS: Record<string, string> = {
    "": t("anime", "seasonAll"),
    WINTER: t("anime", "seasonWinter"),
    SPRING: t("anime", "seasonSpring"),
    SUMMER: t("anime", "seasonSummer"),
    FALL: t("anime", "seasonFall"),
  };

  // 300ms debounce + 2文字以上のみ検索
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setSearch(inputValue.length >= 2 ? inputValue : "");
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (value === "") setSearch(""); // クリア時は即座に反映
  };

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
        const q = normalizeText(search);
        const titleNorm = normalizeText(anime.title);
        const titleEnNorm = normalizeText(anime.titleEn);

        // ひらがな・カタカナ入力はローマ字変換してtitleEnと照合
        const qRomaji = KANA_REGEX.test(search)
          ? normalizeText(toRomaji(search))
          : null;

        const matches =
          titleNorm.includes(q) ||
          titleEnNorm.includes(q) ||
          (qRomaji !== null && titleEnNorm.includes(qRomaji));

        if (!matches) return false;
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
        <p className="mb-2 text-xs font-bold text-text-sub">{t("anime", "filterYear")}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={activeYearKey}
            onChange={(e) => handleYearChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">{t("anime", "all")}</option>
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
                <option key={opt.key || "all"} value={opt.key}>
                  {SEASON_LABELS[opt.key]}
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
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("anime", "searchPlaceholder")}
            className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-sub/50 outline-none"
          />
          {isPending && (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          )}
          {inputValue && !isPending && (
            <button
              onClick={() => handleSearchChange("")}
              className="text-xs text-text-sub hover:text-text-main"
            >
              {t("anime", "clear")}
            </button>
          )}
        </div>
      </div>

      {/* フィルターセクション */}
      <div className="mb-8 space-y-4">
        <div>
          <p className="mb-2 text-xs font-bold text-text-sub">{t("anime", "filterGenre")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedGenre === null
                  ? "bg-accent text-white"
                  : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
              }`}
            >
              {t("anime", "all")}
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
            <p className="mb-2 text-xs font-bold text-text-sub">{t("anime", "filterEpisodes")}</p>
            <div className="flex gap-2">
              {EPISODE_FILTERS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setEpisodeFilter(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    episodeFilter === i
                      ? "bg-accent text-white"
                      : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
                  }`}
                >
                  {EP_LABELS[i]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-text-sub">{t("anime", "filterScore")}</p>
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
        {isPending ? t("anime", "all") : t("anime", "found").replace("{count}", String(filtered.length))}
      </p>

      {filtered.length === 0 && !isPending ? (
        <div className="flex flex-col items-center rounded-2xl border border-text-sub/10 bg-card py-16 text-center">
          <p className="mb-3 text-4xl">🔍</p>
          <p className="font-bold text-text-main">{t("anime", "notFound")}</p>
          {inputValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="mt-4 text-sm text-accent hover:underline"
            >
              {t("anime", "clearKeyword")}
            </button>
          )}
        </div>
      ) : filtered.length > 0 ? (
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
                      {locale === "en" ? `${anime.episodes} eps` : `全${anime.episodes}話`}
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
      ) : null}


      {/* ページネーション */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {currentPage > 1 ? (
          <Link
            href={`${baseHref}${separator}page=${currentPage - 1}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            {locale === "en" ? "← Prev" : "← 前へ"}
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/10 px-6 text-sm text-text-sub/30">
            {locale === "en" ? "← Prev" : "← 前へ"}
          </span>
        )}
        <span className="text-sm text-text-sub">{locale === "en" ? `Page ${currentPage}` : `ページ ${currentPage}`}</span>
        {animeList.length >= 50 ? (
          <Link
            href={`${baseHref}${separator}page=${currentPage + 1}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            {locale === "en" ? "Next →" : "次へ →"}
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/10 px-6 text-sm text-text-sub/30">
            {locale === "en" ? "Next →" : "次へ →"}
          </span>
        )}
      </div>
    </>
  );
}

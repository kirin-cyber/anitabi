"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RANKS, RANK_COLORS, type Rank } from "@/constants/voice-actors";
import type { NotionVoiceActor } from "@/lib/notion";
import { useLanguage } from "@/contexts/LanguageContext";

const RANK_EN: Record<string, string> = {
  新人: "Newcomer", 中堅: "Rising", ベテラン: "Veteran", レジェンド: "Legend",
};

type Props = {
  voiceActors: NotionVoiceActor[];
};

export default function VoiceActorFilter({ voiceActors }: Props) {
  const [search, setSearch] = useState("");
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const { t, locale } = useLanguage();

  const filtered = useMemo(() => {
    return voiceActors.filter((va) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !va.name.toLowerCase().includes(q) &&
          !va.nameEn.toLowerCase().includes(q) &&
          !va.reading.toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedRank && va.rank !== selectedRank) return false;
      return true;
    });
  }, [voiceActors, search, selectedRank]);

  return (
    <>
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
            placeholder={t("voiceActors", "searchPlaceholder")}
            className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-sub/50 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-text-sub hover:text-text-main"
            >
              {t("voiceActors", "clear")}
            </button>
          )}
        </div>
      </div>

      {/* ランクフィルター */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold text-text-sub">{t("voiceActors", "filterRank")}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRank(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedRank === null
                ? "bg-accent text-white"
                : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
            }`}
          >
            {t("voiceActors", "all")}
          </button>
          {RANKS.map((rank) => (
            <button
              key={rank}
              onClick={() =>
                setSelectedRank(selectedRank === rank ? null : rank)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedRank === rank
                  ? `${RANK_COLORS[rank]} text-white`
                  : "bg-card text-text-sub border border-text-sub/15 hover:border-accent/40"
              }`}
            >
              {locale === "en" ? (RANK_EN[rank] ?? rank) : rank}
            </button>
          ))}
        </div>
      </div>

      {/* 結果件数 */}
      <p className="mb-4 text-sm text-text-sub">
        {t("voiceActors", "found").replace("{count}", String(filtered.length))}
      </p>

      {/* カードグリッド */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((va) => {
            const rankColor = RANK_COLORS[va.rank];
            return (
              <Link
                key={va.id}
                href={`/voice-actors/${va.id}`}
                className="group overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background-secondary text-2xl">
                      🎤
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`${rankColor} inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white mb-1`}
                      >
                        {va.rank}
                      </span>
                      <h3 className="font-bold text-text-main group-hover:text-accent transition-colors truncate">
                        {va.name}
                      </h3>
                      <p className="text-xs text-text-sub">{va.nameEn}</p>
                    </div>
                  </div>

                  {va.notableRoles && (
                    <div className="mt-3 rounded-lg bg-background px-3 py-2">
                      <p className="text-[10px] text-text-sub">代表作</p>
                      <p className="text-sm text-text-main truncate">
                        {va.notableRoles}
                      </p>
                    </div>
                  )}

                  {va.isCurrentSeason && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                      <span className="text-[10px] text-red-400">今季出演中</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 text-text-sub">
            条件に一致する声優が見つかりませんでした
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedRank(null);
            }}
            className="mt-4 text-sm text-accent hover:underline"
          >
            フィルターをリセット
          </button>
        </div>
      )}
    </>
  );
}

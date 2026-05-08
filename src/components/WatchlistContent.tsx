"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnimeImage from "@/components/AnimeImage";
import {
  getWatchlist,
  saveWatchlist,
  STATUS_LABELS,
  type WatchlistItem,
  type WatchStatus,
} from "@/lib/watchlist";

const FILTERS: { value: WatchStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "want", label: "見たい" },
  { value: "watching", label: "視聴中" },
  { value: "watched", label: "見た" },
];

export default function WatchlistContent() {
  const [list, setList] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<WatchStatus | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setList(getWatchlist());
    setMounted(true);
  }, []);

  const filtered = filter === "all" ? list : list.filter((i) => i.status === filter);

  const handleStatusChange = (id: number, s: WatchStatus) => {
    const updated = list.map((i) => (i.id === id ? { ...i, status: s } : i));
    setList(updated);
    saveWatchlist(updated);
  };

  const handleRemove = (id: number) => {
    const updated = list.filter((i) => i.id !== id);
    setList(updated);
    saveWatchlist(updated);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* フィルタータブ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === value
                ? "bg-accent text-white"
                : "border border-text-sub/30 text-text-sub hover:border-accent hover:text-text-main"
            }`}
          >
            {label}
            {value !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                {list.filter((i) => i.status === value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* リスト */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-text-sub/15 bg-card py-20 text-center">
          <p className="mb-3 text-4xl">📚</p>
          <p className="text-text-sub">
            {filter === "all" ? "まだ登録がありません" : "該当する作品がありません"}
          </p>
          <Link
            href="/anime"
            className="mt-4 text-sm text-accent transition-opacity hover:opacity-70"
          >
            アニメ一覧から追加する →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 overflow-hidden rounded-xl border border-text-sub/15 bg-card p-3"
            >
              <Link href={`/anime/${item.id}`} className="shrink-0">
                <div className="h-20 w-14 overflow-hidden rounded bg-background">
                  <AnimeImage
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full"
                  />
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/anime/${item.id}`}>
                  <h3 className="truncate text-sm font-bold text-text-main transition-colors hover:text-accent">
                    {item.title}
                  </h3>
                </Link>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(["want", "watching", "watched"] as WatchStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(item.id, s)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        item.status === s
                          ? "bg-accent text-white"
                          : "border border-text-sub/20 text-text-sub hover:border-accent hover:text-text-main"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                aria-label="削除"
                className="mt-0.5 shrink-0 text-text-sub/40 transition-colors hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

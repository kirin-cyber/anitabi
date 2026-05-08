"use client";

import { useState, useEffect } from "react";
import { getWatchlist, saveWatchlist, STATUS_LABELS, type WatchStatus, type WatchlistItem } from "@/lib/watchlist";

interface Props {
  animeId: number;
  animeTitle: string;
  animeImage: string;
}

export default function WatchlistButton({ animeId, animeTitle, animeImage }: Props) {
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const item = getWatchlist().find((i) => i.id === animeId);
    setStatus(item?.status ?? null);
  }, [animeId]);

  const handleSet = (s: WatchStatus) => {
    const list = getWatchlist().filter((i) => i.id !== animeId);
    const newItem: WatchlistItem = {
      id: animeId,
      title: animeTitle,
      image: animeImage,
      status: s,
      addedAt: Date.now(),
    };
    saveWatchlist([...list, newItem]);
    setStatus(s);
    setShowMenu(false);
  };

  const handleRemove = () => {
    saveWatchlist(getWatchlist().filter((i) => i.id !== animeId));
    setStatus(null);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors ${
          status
            ? "border-accent bg-accent/10 text-accent"
            : "border-text-sub/30 text-text-sub hover:border-accent hover:text-accent"
        }`}
      >
        {status ? `❤️ ${STATUS_LABELS[status]}` : "❤️ お気に入り"}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-text-sub/15 bg-card shadow-lg">
            {(["want", "watching", "watched"] as WatchStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleSet(s)}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-background-secondary ${
                  status === s ? "font-medium text-accent" : "text-text-main"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
            {status && (
              <button
                onClick={handleRemove}
                className="block w-full border-t border-text-sub/10 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-background-secondary"
              >
                削除
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

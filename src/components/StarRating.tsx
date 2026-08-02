"use client";

import { useState } from "react";
import { useRating } from "@/lib/useRating";
import type { Rating } from "@/lib/rating";

interface Props {
  animeId: number;
}

const STARS: Rating[] = [1, 2, 3, 4, 5];

// ユーザー参加型★評価UI。ログイン不要・localStorage保存。
// クリックで評価、同じ★を再クリックで解除、ホバー（タップ端末はfocus）でプレビュー表示。
export default function StarRating({ animeId }: Props) {
  const { rating, rate, clear } = useRating(animeId);
  const [hovered, setHovered] = useState<Rating | null>(null);

  const displayValue = hovered ?? rating ?? 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHovered(null)}
        role="radiogroup"
        aria-label="この作品の評価"
      >
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star}つ星`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(null)}
            onClick={() => (rating === star ? clear() : rate(star))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl leading-none transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className={star <= displayValue ? "text-accent" : "text-text-sub/30"}>
              ★
            </span>
          </button>
        ))}
      </div>
      {rating !== null && (
        <button
          type="button"
          onClick={clear}
          className="text-xs text-text-sub/70 transition-colors hover:text-red-400"
        >
          削除
        </button>
      )}
    </div>
  );
}

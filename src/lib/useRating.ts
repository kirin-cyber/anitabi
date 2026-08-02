"use client";

// ★評価の状態管理フック（localStorage連携）
import { useCallback, useEffect, useState } from "react";
import { getRating, removeRating, setRating, type Rating } from "@/lib/rating";

export function useRating(animeId: number) {
  const [rating, setRatingState] = useState<Rating | null>(null);

  useEffect(() => {
    setRatingState(getRating(animeId));
  }, [animeId]);

  const rate = useCallback(
    (value: Rating) => {
      setRating(animeId, value);
      setRatingState(value);
    },
    [animeId],
  );

  const clear = useCallback(() => {
    removeRating(animeId);
    setRatingState(null);
  }, [animeId]);

  return { rating, rate, clear };
}

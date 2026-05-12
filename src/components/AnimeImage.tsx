"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  contain?: boolean;
}

export default function AnimeImage({ src, alt, className = "", contain = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // キャッシュ済み画像は onLoad が発火しないため complete で判定
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-background-secondary text-3xl ${className}`}>
        🎬
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 画像は常に表示、スケルトンが上に重なり読み込み完了後に消える */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
        className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`}
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-background-secondary" />
      )}
    </div>
  );
}

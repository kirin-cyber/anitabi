"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  contain?: boolean;
}

export default function AnimeImage({ src, alt, className = "", contain = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-background-secondary text-3xl ${className}`}>
        🎬
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-background-secondary" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
        className={`h-full w-full transition-opacity duration-300 ${contain ? "object-contain" : "object-cover"} ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

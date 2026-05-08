"use client";

import { useState } from "react";

interface Props {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const xText = encodeURIComponent(`${title}をAniTabiで見つけた！ #AniTabi`);
  const xUrl = `https://twitter.com/intent/tweet?text=${xText}&url=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-sub">シェア:</span>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-text-sub/30 px-3 text-xs text-text-sub transition-colors hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
      >
        𝕏 ポスト
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-text-sub/30 px-3 text-xs text-text-sub transition-colors hover:border-[#06C755] hover:text-[#06C755]"
      >
        LINE
      </a>
      <button
        onClick={handleCopy}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-text-sub/30 px-3 text-xs text-text-sub transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? "✓ コピー済み" : "🔗 URLコピー"}
      </button>
    </div>
  );
}

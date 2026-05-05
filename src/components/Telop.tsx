"use client";

import { TELOP_TITLES } from "@/constants/dummy-anime";

export default function Telop({ titles }: { titles?: string[] }) {
  const source = titles && titles.length > 0 ? titles : TELOP_TITLES;
  // タイトルを2回繰り返してシームレスなループを作る
  const items = [...source, ...source];

  return (
    <div className="relative overflow-hidden bg-background py-2 border-y border-text-sub/10">
      {/* 赤い点滅ドット + ラベル */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-background via-background to-transparent pl-3 pr-6">
        <span className="relative mr-2 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span className="text-xs font-bold text-red-400 whitespace-nowrap">
          ON AIR
        </span>
      </div>

      {/* 自動横スクロール */}
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap pl-24">
        {items.map((title, i) => (
          <span key={i} className="mx-6 text-sm text-text-main">
            {title}
          </span>
        ))}
      </div>
    </div>
  );
}

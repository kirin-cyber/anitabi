"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  type SeasonInfo,
  shiftSeasonInfo,
  seasonInfoToQuery,
  formatSeasonAnimeLabel,
} from "@/lib/season";

interface Props {
  // 現在表示中のクール
  current: SeasonInfo;
  // 遷移先のベースパス（例: "/" や "/ranking"）
  basePath: string;
}

// クール切り替えラベル（前クール/次クール/季節選択のaria-label）。
// translations.tsは編集対象外のため、HomeContent.tsxの既存パターンに倣いここでインライン管理する。
const LABEL = {
  ja: { prev: "前クール", next: "次クール", select: "クールを選択" },
  en: { prev: "Prev season", next: "Next season", select: "Select season" },
};

function buildHref(basePath: string, info: SeasonInfo): string {
  const { year, season } = seasonInfoToQuery(info);
  return `${basePath}?year=${year}&season=${season}`;
}

export default function SeasonNav({ current, basePath }: Props) {
  const router = useRouter();
  const { locale } = useLanguage();
  const label = LABEL[locale];

  const prev = shiftSeasonInfo(current, -1);
  const next = shiftSeasonInfo(current, 1);

  // 季節選択プルダウン候補（前後4クールずつ、現在クールを含む計9件）
  const options: SeasonInfo[] = [];
  for (let offset = 4; offset >= -4; offset--) {
    options.push(shiftSeasonInfo(current, offset));
  }

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, season] = e.target.value.split(":");
    router.push(`${basePath}?year=${year}&season=${season}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={buildHref(basePath, prev)}
        aria-label={label.prev}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-text-sub/30 px-4 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
      >
        ← {formatSeasonAnimeLabel(prev, locale)}
      </Link>

      <select
        value={`${current.year}:${current.season.toLowerCase()}`}
        onChange={handleSelect}
        aria-label={label.select}
        className="h-9 rounded-full border border-accent/50 bg-card px-4 text-sm font-bold text-accent focus:outline-none"
      >
        {options.map((info) => {
          const q = seasonInfoToQuery(info);
          return (
            <option key={`${q.year}:${q.season}`} value={`${q.year}:${q.season}`}>
              {formatSeasonAnimeLabel(info, locale)}
            </option>
          );
        })}
      </select>

      <Link
        href={buildHref(basePath, next)}
        aria-label={label.next}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-text-sub/30 px-4 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
      >
        {formatSeasonAnimeLabel(next, locale)} →
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import { getScheduleWorks, getCurrentSeason } from "@/lib/annict";
import { getServerLocale, getT } from "@/lib/locale";

export const metadata: Metadata = {
  title: "2026年春アニメ放送表 一覧 - AniTabi",
  description: "2026年春放送中アニメの放送表・一覧。TVアニメ・OVA・劇場版まとめてチェック。",
  openGraph: {
    title: "2026年春アニメ放送表 一覧 - AniTabi",
    description: "2026年春放送中アニメの放送表・一覧。TVアニメ・OVA・劇場版まとめてチェック。",
    url: "https://anitabi.site/schedule",
    type: "website",
  },
};

const MEDIA_LABELS: Record<string, string> = {
  TV: "TVアニメ",
  OVA: "OVA",
  MOVIE: "劇場版",
  WEB: "Web",
  OTHER: "その他",
};

function formatSeasonLabel(season: string): string {
  return season
    .replace("-", "年")
    .replace("spring", "春")
    .replace("summer", "夏")
    .replace("autumn", "秋")
    .replace("winter", "冬");
}

export default async function SchedulePage() {
  const locale = await getServerLocale();
  const t = getT(locale);
  const season = getCurrentSeason();
  const works = await getScheduleWorks(season, 50);

  const tvWorks = works.filter((w) => w.media === "TV");
  const otherWorks = works.filter((w) => w.media !== "TV");

  const seasonLabel = formatSeasonLabel(season);

  const WorkCard = ({ work }: { work: (typeof works)[number] }) => {
    const image =
      work.image?.recommendedImageUrl ?? work.image?.facebookOgImageUrl ?? "";
    return (
      <div className="flex items-center gap-3 rounded-xl border border-text-sub/15 bg-card p-3 transition-colors hover:border-accent/30">
        <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-background">
          {image ? (
            <img
              src={image}
              alt={work.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">
              🎬
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-main">
            {work.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-sub">
            {work.episodesCount > 0 && <span>{locale === "en" ? `${work.episodesCount} eps` : `全${work.episodesCount}話`}</span>}
            {work.media && work.media !== "TV" && (
              <span className="rounded-full bg-background-secondary px-2 py-0.5 text-[10px]">
                {MEDIA_LABELS[work.media] ?? work.media}
              </span>
            )}
          </div>
          {work.officialSiteUrl && (
            <a
              href={work.officialSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 text-xs text-text-sub transition-colors hover:text-accent"
            >
              {t("schedule", "officialSite")} ↗
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
              📅 {t("schedule", "title")}
            </h1>
            <p className="mt-1 text-sm text-text-sub">
              {seasonLabel} · {locale === "en" ? `${works.length} titles airing` : `今季放送中アニメ（${works.length}作品）`}
            </p>
          </div>

          {/* TVアニメ */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              TVアニメ
              <span className="text-sm font-normal text-text-sub">
                {tvWorks.length}作品
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tvWorks.map((work) => (
                <WorkCard key={work.annictId} work={work} />
              ))}
              {tvWorks.length === 0 && (
                <p className="col-span-3 py-12 text-center text-text-sub">
                  データを取得できませんでした
                </p>
              )}
            </div>
          </section>

          {/* その他（OVA・映画など） */}
          {otherWorks.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                OVA・劇場版・その他
                <span className="text-sm font-normal text-text-sub">
                  {otherWorks.length}作品
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {otherWorks.map((work) => (
                  <WorkCard key={work.annictId} work={work} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-text-sub/20 bg-background-secondary/50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-6 text-center text-xs text-text-sub">
          <p>
            &copy; 2026{" "}
            <span className="font-bold text-text-main">AniTabi</span> by kirin
          </p>
        </div>
      </footer>
    </>
  );
}

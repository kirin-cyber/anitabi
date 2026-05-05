import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AnimeImage from "@/components/AnimeImage";
import { RANK_COLORS } from "@/constants/voice-actors";
import { getVoiceActorById } from "@/lib/notion";
import { getVoiceActorWorks } from "@/lib/anilist";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const va = await getVoiceActorById(id);
  if (!va) return { title: "声優が見つかりません - AniTabi" };
  return {
    title: `${va.name} - AniTabi`,
    description: va.description,
  };
}

export default async function VoiceActorDetailPage({ params }: Props) {
  const { id } = await params;
  const va = await getVoiceActorById(id);
  if (!va) notFound();

  const rankColor = RANK_COLORS[va.rank];
  const yearsActive = new Date().getFullYear() - va.debutYear;

  // AniList から出演作品を取得（日本語名のスペースを除去して検索）
  const searchName = va.name.replace(/\s/g, "");
  const staffInfo = await getVoiceActorWorks(searchName);
  const works = staffInfo?.works ?? [];

  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* パンくず */}
          <nav className="mb-6 text-sm text-text-sub">
            <Link href="/" className="hover:text-text-main">ホーム</Link>
            <span className="mx-2">/</span>
            <Link href="/voice-actors" className="hover:text-text-main">声優一覧</Link>
            <span className="mx-2">/</span>
            <span className="text-text-main">{va.name}</span>
          </nav>

          {/* プロフィールカード */}
          <div className="overflow-hidden rounded-2xl border border-text-sub/15 bg-card">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* アバター（AniListの画像があれば使用） */}
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-background-secondary">
                  {staffInfo?.image ? (
                    <img
                      src={staffInfo.image}
                      alt={va.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">🎤</div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <span className={`${rankColor} inline-block rounded-full px-3 py-0.5 text-xs font-bold text-white mb-2`}>
                    {va.rank}
                  </span>

                  <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
                    {va.name}
                  </h1>
                  <p className="mt-0.5 text-sm text-text-sub">{va.reading}</p>
                  <p className="mt-0.5 text-xs text-text-sub">{va.nameEn}</p>

                  {va.description && (
                    <p className="mt-3 leading-relaxed text-text-main">{va.description}</p>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm sm:justify-start">
                    {va.debutYear > 0 && (
                      <>
                        <div>
                          <span className="text-text-sub">デビュー: </span>
                          <span className="font-medium text-text-main">{va.debutYear}年</span>
                        </div>
                        <div>
                          <span className="text-text-sub">活動年数: </span>
                          <span className="font-medium text-text-main">{yearsActive}年</span>
                        </div>
                      </>
                    )}
                    {va.agency && (
                      <div>
                        <span className="text-text-sub">事務所: </span>
                        <span className="font-medium text-text-main">{va.agency}</span>
                      </div>
                    )}
                    {works.length > 0 && (
                      <div>
                        <span className="text-text-sub">出演作品: </span>
                        <span className="font-medium text-text-main">{works.length}件+</span>
                      </div>
                    )}
                  </div>

                  {/* 外部リンク */}
                  <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                    {va.officialUrl && (
                      <a
                        href={va.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-text-sub/30 px-4 text-xs text-text-sub transition-colors hover:border-accent hover:text-text-main"
                      >
                        公式サイト
                      </a>
                    )}
                    {va.xUrl && (
                      <a
                        href={va.xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-text-sub/30 px-4 text-xs text-text-sub transition-colors hover:border-accent hover:text-text-main"
                      >
                        X (Twitter)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 今季出演 */}
          {va.isCurrentSeason && (
            <section className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <h2 className="text-lg font-bold">今季出演中</h2>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-text-main">
                現在放送中のアニメに出演しています
              </div>
            </section>
          )}

          {/* 代表作（Notionの手動設定データ） */}
          {va.notableRoles && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold">代表作</h2>
              <div className="rounded-xl border border-text-sub/15 bg-card px-4 py-3 text-sm text-text-main leading-relaxed">
                {va.notableRoles}
              </div>
            </section>
          )}

          {/* 出演作品一覧（AniList自動取得） */}
          {works.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold">
                出演作品一覧
                <span className="ml-2 text-sm font-normal text-text-sub">（{works.length}件・人気順）</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {works.map((work) => (
                  <Link
                    key={work.mediaId}
                    href={`/anime/${work.mediaId}`}
                    className="group overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50"
                  >
                    <div className="relative h-32 overflow-hidden bg-background">
                      <AnimeImage
                        src={work.coverImage ?? ""}
                        alt={work.titleNative ?? work.titleRomaji ?? ""}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      />
                      {work.averageScore && work.averageScore > 0 && (
                        <span className="absolute right-2 top-2 rounded-lg bg-background/80 px-2 py-0.5 text-xs font-bold text-accent backdrop-blur-sm">
                          ★ {work.averageScore}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-text-main group-hover:text-accent transition-colors truncate">
                        {work.titleNative ?? work.titleRomaji}
                      </p>
                      {work.characterName && (
                        <p className="mt-0.5 text-xs text-accent truncate">
                          {work.characterName} 役
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-text-sub">
                        {work.seasonYear ? `${work.seasonYear}年` : ""}
                        {work.episodes ? ` · 全${work.episodes}話` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/voice-actors"
              className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              ← 声優一覧に戻る
            </Link>
          </div>
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

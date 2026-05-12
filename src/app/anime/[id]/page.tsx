import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AnimeImage from "@/components/AnimeImage";
import ShareButtons from "@/components/ShareButtons";
import WatchlistButton from "@/components/WatchlistButton";
import { getAnimeById, searchAnimeByGenres, getAnimeByStudio, getVoiceActorWorks, searchAnimeByTagsAndGenres } from "@/lib/anilist";
import { getAnimeDescriptionByTitle } from "@/lib/annict";
import { getVoiceActors } from "@/lib/notion";
import { GENRES } from "@/constants/genres";

const GENRE_MAP: Record<string, string> = {
  Action: "アクション",
  Adventure: "アドベンチャー",
  Comedy: "コメディ",
  Drama: "ドラマ",
  Fantasy: "ファンタジー",
  Horror: "ホラー",
  Mystery: "ミステリー",
  Romance: "恋愛",
  "Sci-Fi": "SF",
  "Slice of Life": "日常",
  Sports: "スポーツ",
  Supernatural: "超自然",
  Thriller: "スリラー",
  Psychological: "サイコ",
  Mecha: "ロボット",
  Music: "音楽",
};

const SEASON_MAP: Record<string, string> = {
  WINTER: "冬",
  SPRING: "春",
  SUMMER: "夏",
  FALL: "秋",
};

function mapGenre(g: string): string {
  return GENRE_MAP[g] ?? g;
}

// 配信サービス設定（アフィリエイトIDは後から追加可能）
const STREAMING_CONFIG: Record<string, {
  label: string; icon: string; bg: string;
  affiliateParam: string; searchUrl: string;
}> = {
  "Netflix":            { label: "Netflix",       icon: "N",  bg: "bg-red-600",    affiliateParam: "", searchUrl: "https://www.netflix.com/search?q={title}" },
  "Amazon Prime Video": { label: "Prime Video",   icon: "P",  bg: "bg-blue-500",   affiliateParam: "", searchUrl: "https://www.amazon.co.jp/s?k={title}&i=instant-video" },
  "U-NEXT":             { label: "U-NEXT",        icon: "U",  bg: "bg-gray-800",   affiliateParam: "", searchUrl: "https://video.unext.jp/search?query={title}" },
  "dアニメストア":       { label: "dアニメストア", icon: "d",  bg: "bg-red-500",    affiliateParam: "", searchUrl: "https://animestore.docomo.ne.jp/animestore/sch_pc?searchKey={title}" },
  "Disney Plus":        { label: "Disney+",       icon: "D+", bg: "bg-blue-800",   affiliateParam: "", searchUrl: "https://www.disneyplus.com/search/{title}" },
  "Hulu":               { label: "Hulu",          icon: "H",  bg: "bg-green-600",  affiliateParam: "", searchUrl: "https://www.hulu.jp/search?q={title}" },
  "ABEMA":              { label: "ABEMA",         icon: "A",  bg: "bg-blue-600",   affiliateParam: "", searchUrl: "https://abema.tv/search?q={title}" },
  "Crunchyroll":        { label: "Crunchyroll",   icon: "CR", bg: "bg-orange-500", affiliateParam: "", searchUrl: "https://www.crunchyroll.com/search?q={title}" },
};

// 日本サービス優先の表示順
const STREAMING_PRIORITY = [
  "Netflix", "Amazon Prime Video", "U-NEXT", "dアニメストア",
  "Disney Plus", "Hulu", "ABEMA", "Crunchyroll",
];

function buildStreamingUrl(directUrl: string, site: string): string {
  const param = STREAMING_CONFIG[site]?.affiliateParam ?? "";
  return param ? `${directUrl}${param}` : directUrl;
}

function buildSearchUrl(site: string, searchTitle: string): string {
  const cfg = STREAMING_CONFIG[site];
  if (!cfg) return "#";
  const url = cfg.searchUrl.replace("{title}", encodeURIComponent(searchTitle));
  return cfg.affiliateParam ? `${url}${cfg.affiliateParam}` : url;
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const anime = await getAnimeById(Number(id));
  if (!anime) return { title: "作品が見つかりません - AniTabi" };
  const title = anime.title.native ?? anime.title.romaji ?? `ID:${anime.id}`;
  return {
    title: `${title} - AniTabi`,
    description: anime.description?.slice(0, 160) ?? "",
  };
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  const anime = await getAnimeById(Number(id));
  if (!anime) notFound();

  const title = anime.title.native ?? anime.title.romaji ?? `ID:${anime.id}`;
  const subtitle = anime.title.romaji ?? anime.title.english ?? "";
  const genres = anime.genres.map(mapGenre);
  const studio = anime.studios.nodes[0]?.name ?? "";
  const seasonLabel =
    anime.seasonYear && anime.season
      ? `${anime.seasonYear}年 ${SEASON_MAP[anime.season] ?? ""}アニメ`
      : anime.seasonYear
        ? `${anime.seasonYear}年`
        : "";

  // 声優情報（日本語声優がいるキャラのみ）
  const characters = anime.characters.edges
    .filter((e) => e.voiceActors.length > 0)
    .slice(0, 6);

  // レコメンド用: タグ・人気度を活用した精度向上
  const normalize = (s: string) => s.replace(/\s/g, "");
  const firstVaName =
    characters[0]?.voiceActors[0]?.name.native ??
    characters[0]?.voiceActors[0]?.name.full ??
    "";
  const targetTags = (anime.tags ?? [])
    .filter((t) => t.rank >= 60)
    .slice(0, 5)
    .map((t) => t.name);
  const targetPopularity = anime.popularity ?? 0;

  const [annictDescription, notionVAs, genreRelated, studioRelated, vaWorks, tagRelated] =
    await Promise.all([
      getAnimeDescriptionByTitle(title),
      getVoiceActors().catch(() => []),
      anime.genres.length > 0
        ? searchAnimeByGenres(anime.genres.slice(0, 2), 12)
        : Promise.resolve([]),
      studio ? getAnimeByStudio(studio) : Promise.resolve([]),
      firstVaName ? getVoiceActorWorks(firstVaName) : Promise.resolve(null),
      targetTags.length > 0
        ? searchAnimeByTagsAndGenres(targetTags.slice(0, 3), anime.genres.slice(0, 2), 60, 12)
        : Promise.resolve([]),
    ]);

  const vaNameMap = new Map(
    notionVAs.map((va) => [normalize(va.name), va.id]),
  );

  // HTMLタグ・エンティティを除去するユーティリティ
  function stripHtml(text: string): string {
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/&mdash;/g, "—")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\n/g, " ")
      .trim();
  }

  // Annict日本語あらすじ優先、なければAniList英語あらすじ
  const description = annictDescription
    ? annictDescription
    : anime.description
      ? stripHtml(anime.description)
      : "";

  // 強化版レコメンド: ジャンル・スタジオ・声優・タグ・人気度を組み合わせ
  type RelatedReason = "genre" | "studio" | "voiceActor" | "tags" | "popularity";
  interface EnhancedRelated {
    id: number;
    title: string;
    image: string;
    score: number;
    popularity: number | null;
    genres: string[];
    reasons: RelatedReason[];
  }

  const relatedMap = new Map<number, EnhancedRelated>();

  const addRelated = (
    id: number,
    title: string,
    image: string,
    score: number,
    popularity: number | null,
    genres: string[],
    reason: RelatedReason,
  ) => {
    if (id === anime.id) return;
    if (relatedMap.has(id)) {
      const item = relatedMap.get(id)!;
      if (!item.reasons.includes(reason)) item.reasons.push(reason);
    } else {
      relatedMap.set(id, { id, title, image, score, popularity, genres, reasons: [reason] });
    }
  };

  for (const r of genreRelated) {
    addRelated(r.id, r.title.native ?? `ID:${r.id}`, r.coverImage?.large ?? "",
      r.averageScore ?? 0, null, r.genres.map(mapGenre), "genre");
  }
  for (const r of studioRelated) {
    addRelated(r.id, r.title.native ?? `ID:${r.id}`, r.coverImage?.large ?? "",
      r.averageScore ?? 0, null, r.genres.map(mapGenre), "studio");
  }
  if (vaWorks) {
    for (const work of vaWorks.works.slice(0, 10)) {
      addRelated(work.mediaId, work.titleNative ?? work.titleRomaji ?? `ID:${work.mediaId}`,
        work.coverImage ?? "", work.averageScore ?? 0, null, work.genres.map(mapGenre), "voiceActor");
    }
  }
  for (const r of tagRelated) {
    addRelated(r.id, r.title.native ?? `ID:${r.id}`, r.coverImage?.large ?? "",
      r.averageScore ?? 0, r.popularity ?? null, r.genres.map(mapGenre), "tags");
  }

  // 人気度が近い作品にタグ追加（±40%以内）
  if (targetPopularity > 0) {
    for (const item of relatedMap.values()) {
      if (item.popularity != null) {
        const diff = Math.abs(targetPopularity - item.popularity) / targetPopularity;
        if (diff < 0.4 && !item.reasons.includes("popularity")) {
          item.reasons.push("popularity");
        }
      }
    }
  }

  // スコア70以上を優先、理由数→スコアでソート
  const related = Array.from(relatedMap.values())
    .sort((a, b) => {
      const aHigh = a.score >= 70 ? 1 : 0;
      const bHigh = b.score >= 70 ? 1 : 0;
      if (bHigh !== aHigh) return bHigh - aHigh;
      if (b.reasons.length !== a.reasons.length) return b.reasons.length - a.reasons.length;
      return b.score - a.score;
    })
    .slice(0, 6);

  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* パンくず */}
          <nav className="mb-6 text-sm text-text-sub">
            <Link href="/" className="hover:text-text-main">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <Link href="/anime" className="hover:text-text-main">
              アニメ一覧
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-main">{title}</span>
          </nav>

          {/* メインカード */}
          <div className="overflow-hidden rounded-2xl border border-text-sub/15 bg-card">
            {/* ヒーロー画像 + 情報オーバーレイ */}
            <div className="relative">
              <div className="h-56 overflow-hidden bg-background sm:h-72">
                <AnimeImage
                  src={anime.bannerImage ?? anime.coverImage?.large ?? ""}
                  alt={title}
                  className="h-full w-full"
                  contain={!anime.bannerImage}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {genres.map((g) => {
                    const genreData = GENRES.find((gd) => gd.label === g);
                    return (
                      <span
                        key={g}
                        className={`${genreData?.color ?? "bg-gray-500"} rounded-full px-3 py-0.5 text-xs font-medium text-white`}
                      >
                        {g}
                      </span>
                    );
                  })}
                </div>
                <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
                  {title}
                </h1>
                {subtitle && subtitle !== title && (
                  <p className="mt-1 text-sm text-text-sub">{subtitle}</p>
                )}
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="p-6">
              {/* メタ情報 */}
              <div className="mb-6 flex flex-wrap gap-4 text-sm">
                {anime.averageScore != null && anime.averageScore > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-sub">評価</span>
                    <span className="font-bold text-accent">
                      ★ {anime.averageScore}
                    </span>
                  </div>
                )}
                {anime.episodes != null && anime.episodes > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-sub">話数</span>
                    <span className="font-bold text-text-main">
                      全{anime.episodes}話
                    </span>
                  </div>
                )}
                {seasonLabel && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-sub">シーズン</span>
                    <span className="font-bold text-text-main">
                      {seasonLabel}
                    </span>
                  </div>
                )}
                {studio && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-sub">制作</span>
                    <span className="font-bold text-text-main">{studio}</span>
                  </div>
                )}
              </div>

              {/* あらすじ */}
              {description && (
                <div className="mb-6">
                  <h2 className="mb-2 text-sm font-bold text-text-sub">
                    あらすじ
                  </h2>
                  <p className="leading-relaxed text-text-main">
                    {description}
                  </p>
                </div>
              )}

              {/* 声優・キャラクター */}
              {characters.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-3 text-sm font-bold text-text-sub">
                    キャスト
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {characters.map((edge) => {
                      const va = edge.voiceActors[0];
                      const vaNativeName = va?.name.native ?? va?.name.full ?? "";
                      const notionId = vaNameMap.get(normalize(vaNativeName));
                      const href = notionId
                        ? `/voice-actors/${notionId}`
                        : "/voice-actors";

                      return (
                        <Link
                          key={edge.node.id}
                          href={va ? href : "#"}
                          className="flex items-center gap-3 rounded-xl border border-text-sub/10 bg-background-secondary/50 p-3 transition-colors hover:border-accent/40 hover:bg-background-secondary"
                        >
                          {edge.node.image?.medium && (
                            <img
                              src={edge.node.image.medium}
                              alt={edge.node.name.full}
                              className="h-12 w-12 shrink-0 rounded-full object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-text-main">
                              {edge.node.name.native ?? edge.node.name.full}
                            </p>
                            {va && (
                              <p className="truncate text-xs text-text-sub">
                                CV: {va.name.native ?? va.name.full}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* どこで見る？（直リンク優先・検索フォールバック） */}
              {(() => {
                const directMap = new Map(
                  anime.externalLinks
                    .filter((l) => l.type === "STREAMING" && STREAMING_CONFIG[l.site])
                    .map((l) => [l.site, l.url])
                );
                const searchTitle =
                  anime.title.romaji ?? anime.title.native ?? title;
                return (
                  <div className="mb-6">
                    <h2 className="mb-3 text-sm font-bold text-text-sub">
                      どこで見る？
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {STREAMING_PRIORITY.map((site) => {
                        const cfg = STREAMING_CONFIG[site];
                        const directUrl = directMap.get(site);
                        const href = directUrl
                          ? buildStreamingUrl(directUrl, site)
                          : buildSearchUrl(site, searchTitle);
                        const isDirect = !!directUrl;
                        return (
                          <a
                            key={site}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg border text-sm font-medium transition-colors hover:border-accent/40 ${
                              isDirect
                                ? "border-accent/30 bg-accent/5 text-text-main"
                                : "border-text-sub/20 bg-background-secondary text-text-sub"
                            }`}
                          >
                            <span className={`flex h-full w-9 shrink-0 items-center justify-center ${cfg.bg} text-xs font-bold text-white`}>
                              {cfg.icon}
                            </span>
                            <span className="pr-3">
                              {isDirect ? cfg.label : `${cfg.label}で探す`}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-text-sub/60">
                      ※「で探す」はサービス内検索リンクです。配信状況は変更される場合があります
                    </p>
                  </div>
                );
              })()}

              {/* 外部リンク */}
              {anime.siteUrl && (
                <div className="mb-6">
                  <h2 className="mb-2 text-sm font-bold text-text-sub">
                    外部リンク
                  </h2>
                  <a
                    href={anime.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-text-sub/20 bg-background-secondary px-4 py-2 text-sm font-medium text-text-main transition-colors hover:border-accent/40"
                  >
                    AniList で見る ↗
                  </a>
                </div>
              )}

              {/* 評価バー */}
              {anime.averageScore != null && anime.averageScore > 0 && (
                <div className="mb-6">
                  <h2 className="mb-2 text-sm font-bold text-text-sub">
                    ユーザー評価
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${anime.averageScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-accent">
                      {anime.averageScore}
                    </span>
                  </div>
                </div>
              )}

              {/* お気に入り・シェア */}
              <div className="flex flex-wrap items-center gap-3 border-t border-text-sub/10 pt-6">
                <WatchlistButton
                  animeId={anime.id}
                  animeTitle={title}
                  animeImage={anime.coverImage?.large ?? ""}
                />
                <ShareButtons
                  title={title}
                  url={`https://anitabi.jp/anime/${anime.id}`}
                />
              </div>
            </div>
          </div>

          {/* 聖地巡礼 */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-text-sub/15 bg-card p-6">
            <h2 className="mb-1 text-lg font-bold text-text-main">
              🗺️ 聖地を巡る
            </h2>
            <p className="mb-5 text-sm text-text-sub">
              この作品の舞台となった場所を探してみよう
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://map.seichimap.jp/search?q=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium text-text-main transition-colors hover:bg-accent/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-accent">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                みんなでつくる聖地巡礼マップで探す
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0 text-text-sub">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <a
                href={`https://animetourism88.com/ja/animeSpot?search=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-text-sub/20 bg-background-secondary px-4 py-3 text-sm font-medium text-text-main transition-colors hover:border-accent/40 hover:bg-background-secondary/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-text-sub">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                アニメツーリズム聖地巡礼DBで探す
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0 text-text-sub">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
            <p className="mt-3 text-xs text-text-sub/60">※外部サイトに移動します</p>
          </section>

          {/* レコメンド（強化版） */}
          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold">このアニメが好きな人におすすめ</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => {
                  const REASON_LABELS: Record<RelatedReason, string> = {
                    genre: "同じジャンル",
                    studio: "同スタジオ",
                    voiceActor: "同じ声優出演",
                    tags: "似た雰囲気",
                    popularity: "人気度が近い",
                  };
                  return (
                    <Link
                      key={r.id}
                      href={`/anime/${r.id}`}
                      className="group overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50"
                    >
                      <div className="relative h-36 overflow-hidden bg-background">
                        <AnimeImage
                          src={r.image}
                          alt={r.title}
                          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                        {r.score > 0 && (
                          <span className="absolute right-2 top-2 rounded-lg bg-background/80 px-2 py-0.5 text-xs font-bold text-accent backdrop-blur-sm">
                            ★ {r.score}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        {/* なぜおすすめ？タグ */}
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {r.reasons.map((reason) => (
                            <span
                              key={reason}
                              className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                            >
                              {REASON_LABELS[reason]}
                            </span>
                          ))}
                        </div>
                        <div className="mb-1 flex flex-wrap gap-1">
                          {r.genres.slice(0, 2).map((g) => {
                            const genreData = GENRES.find((gd) => gd.label === g);
                            return (
                              <span
                                key={g}
                                className={`${genreData?.color ?? "bg-gray-500"} rounded-full px-2 py-0.5 text-[10px] font-medium text-white`}
                              >
                                {g}
                              </span>
                            );
                          })}
                        </div>
                        <h3 className="text-sm font-bold text-text-main transition-colors group-hover:text-accent">
                          {r.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 戻るリンク */}
          <div className="mt-8 text-center">
            <Link
              href="/anime"
              className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              ← アニメ一覧に戻る
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

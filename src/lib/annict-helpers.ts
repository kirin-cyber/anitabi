import type { AnnictWork } from "./annict";
import type { Anime } from "@/types/anime";

// 画像URLを優先順位で取得（http → https に統一）
function getImageUrl(work: AnnictWork): string {
  const url =
    work.image?.recommendedImageUrl ||
    work.image?.facebookOgImageUrl ||
    "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

// ジャンル推定（Annict APIにはジャンルフィールドがないため、メディアから簡易推定）
function guessGenreColor(media: string): string {
  switch (media) {
    case "TV": return "bg-purple-600";
    case "OVA": return "bg-teal-500";
    case "MOVIE": return "bg-blue-600";
    default: return "bg-gray-500";
  }
}

function mediaLabel(media: string): string {
  switch (media) {
    case "TV": return "TVアニメ";
    case "OVA": return "OVA";
    case "MOVIE": return "劇場版";
    case "WEB": return "Web";
    default: return media;
  }
}

// AnnictWork → Anime型に変換
export function toAnime(work: AnnictWork, index: number): Anime {
  return {
    id: work.annictId,
    title: work.title,
    titleEn: "",
    image: getImageUrl(work),
    genre: [mediaLabel(work.media)],
    genreColor: guessGenreColor(work.media),
    episodes: work.episodesCount || 0,
    score: 0,
    description: "",
    streaming: [],
    season: work.seasonYear && work.seasonName
      ? `${work.seasonYear}${seasonLabel(work.seasonName)}`
      : "",
  };
}

function seasonLabel(name: string): string {
  switch (name) {
    case "WINTER": return "冬";
    case "SPRING": return "春";
    case "SUMMER": return "夏";
    case "AUTUMN": return "秋";
    default: return "";
  }
}

// 最新情報ページ用の変換
export function toNewsWork(work: AnnictWork) {
  return {
    id: work.annictId,
    title: work.title,
    episodes: work.episodesCount || 0,
    media: mediaLabel(work.media),
    officialUrl: work.officialSiteUrl || "",
    twitterUrl: work.twitterUsername
      ? `https://x.com/${work.twitterUsername}`
      : "",
    image: getImageUrl(work),
  };
}

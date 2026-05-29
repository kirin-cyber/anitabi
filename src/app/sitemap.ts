import type { MetadataRoute } from "next";
import { getVoiceActors } from "@/lib/notion";
import { getAnimeBySeason } from "@/lib/anilist";

const BASE_URL = "https://anitabi.site";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE_URL}/anime`, changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/diagnosis`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE_URL}/voice-actors`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE_URL}/ranking`, changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE_URL}/schedule`, changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE_URL}/news`, changeFrequency: "daily", priority: 0.7 },
  { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
];

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentYear = new Date().getFullYear();

  // 直近3年のシーズンアニメIDを収集
  const animeIdSet = new Set<number>();
  const yearRange = [currentYear - 2, currentYear - 1, currentYear];

  await Promise.allSettled(
    yearRange.flatMap((year) =>
      SEASONS.map(async (season) => {
        try {
          const anime = await getAnimeBySeason(year, season, 1);
          anime.forEach((a) => animeIdSet.add(a.id));
        } catch {
          // AniList APIエラーは無視して続行
        }
      })
    )
  );

  const animePages: MetadataRoute.Sitemap = Array.from(animeIdSet).map((id) => ({
    url: `${BASE_URL}/anime/${id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 声優ページ（Notion全件）
  let voiceActorPages: MetadataRoute.Sitemap = [];
  try {
    const voiceActors = await getVoiceActors();
    voiceActorPages = voiceActors.map((va) => ({
      url: `${BASE_URL}/voice-actors/${va.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Notion APIエラーは無視
  }

  return [...STATIC_PAGES, ...animePages, ...voiceActorPages];
}

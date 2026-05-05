import Header from "@/components/Header";
import HomeContent from "@/components/HomeContent";
import { DUMMY_ANIME } from "@/constants/dummy-anime";
import { getSeasonWorks, getCurrentSeason } from "@/lib/annict";
import { toAnime } from "@/lib/annict-helpers";
import { getAnimeBySeason, searchAnimeByTitle } from "@/lib/anilist";
import type { Anime } from "@/types/anime";

export default async function Home() {
  // Annict APIからリアルデータ取得（50件）
  let animeList: Anime[];
  let allAnimeList: Anime[];
  try {
    const works = await getSeasonWorks(getCurrentSeason(), 50);
    if (works.length > 0) {
      allAnimeList = works.map(toAnime);
      animeList = allAnimeList.slice(0, 10);
    } else {
      animeList = DUMMY_ANIME as unknown as Anime[];
      allAnimeList = animeList;
    }
  } catch {
    animeList = DUMMY_ANIME as unknown as Anime[];
    allAnimeList = animeList;
  }

  // 画像が空のアニメをAniList画像で補完
  try {
    const [spring1, spring2, winter] = await Promise.all([
      getAnimeBySeason(2026, "SPRING", 1),
      getAnimeBySeason(2026, "SPRING", 2),
      getAnimeBySeason(2025, "FALL", 1),
    ]);
    const anilistWorks = [...spring1, ...spring2, ...winter];
    const normalize = (s: string) =>
      s.replace(/\s/g, "").replace(/[第話期クール0-9]/g, "").toLowerCase();
    const imgMap = new Map<string, string>();
    for (const w of anilistWorks) {
      const key = normalize(w.title.native ?? "");
      if (key && w.coverImage?.large) imgMap.set(key, w.coverImage.large);
    }
    allAnimeList = allAnimeList.map((a) => {
      if (a.image) return a;
      const key = normalize(a.title);
      const img =
        imgMap.get(key) ??
        [...imgMap.entries()].find(
          ([k]) => k.length >= 5 && (key.startsWith(k) || k.startsWith(key))
        )?.[1] ??
        "";
      return img ? { ...a, image: img } : a;
    });
    animeList = allAnimeList.slice(0, 10);

    const missing = allAnimeList.filter((a) => !a.image).slice(0, 5);
    if (missing.length > 0) {
      const results = await Promise.allSettled(
        missing.map((a) => searchAnimeByTitle(a.title))
      );
      const titleToImg = new Map<string, string>();
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.length > 0) {
          titleToImg.set(missing[i].id.toString(), r.value[0].coverImage?.large ?? "");
        }
      });
      allAnimeList = allAnimeList.map((a) => {
        if (a.image) return a;
        const img = titleToImg.get(a.id.toString()) ?? "";
        return img ? { ...a, image: img } : a;
      });
      animeList = allAnimeList.slice(0, 10);
    }
  } catch {
    // 補完失敗時はそのまま表示
  }

  return (
    <>
      <Header />
      <HomeContent animeList={animeList} allAnimeList={allAnimeList} />
    </>
  );
}

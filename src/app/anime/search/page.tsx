import { redirect } from "next/navigation";
import { searchAnimeByTitle } from "@/lib/anilist";

type Props = {
  searchParams: Promise<{ title?: string }>;
};

// シーズン・巻数サフィックスを除去して基本タイトルを返す
function stripSeasonSuffix(title: string): string {
  return title
    .replace(/\s+(4th|3rd|2nd|1st|\d+th)\s+season.*$/i, "")
    .replace(/\s+第\d+期.*$/, "")
    .replace(/\s+Season\s+\d+.*$/i, "")
    .replace(/\s+S\d+$/i, "")
    .replace(/\s+\d+期.*$/, "")
    .replace(/\s+Part\s+\d+.*$/i, "")
    .replace(/\s+[IVX]+期.*$/, "")
    .trim();
}

async function findAnilistId(title: string): Promise<number | null> {
  try {
    const results = await searchAnimeByTitle(title);
    if (results.length > 0) return results[0].id;
  } catch {
    // ignore
  }
  return null;
}

export default async function AnimeSearchRedirectPage({ searchParams }: Props) {
  const { title } = await searchParams;
  if (!title) redirect("/anime");

  // 1. フルタイトルで検索
  let id = await findAnilistId(title);
  if (id) redirect(`/anime/${id}`);

  // 2. シーズンサフィックスを除去して再検索
  const baseTitle = stripSeasonSuffix(title);
  if (baseTitle && baseTitle !== title) {
    id = await findAnilistId(baseTitle);
    if (id) redirect(`/anime/${id}`);
  }

  // 3. 最初の15文字で再検索
  const shortTitle = title.slice(0, 15).trim();
  if (shortTitle && shortTitle !== baseTitle) {
    id = await findAnilistId(shortTitle);
    if (id) redirect(`/anime/${id}`);
  }

  // 4. 見つからない場合はアニメ一覧へ
  redirect("/anime");
}

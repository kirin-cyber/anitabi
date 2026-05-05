import { NextRequest, NextResponse } from "next/server";
import {
  searchAnimeByGenresAndScore,
  type AniListAnime,
} from "@/lib/anilist";

// Q1（気分）→ AniListジャンル
const Q1_MAP: Record<string, string[]> = {
  笑いたい: ["Comedy"],
  泣きたい: ["Drama", "Romance"],
  ドキドキしたい: ["Action", "Thriller"],
  ゾクゾクしたい: ["Horror", "Psychological"],
  癒されたい: ["Slice of Life"],
};

// Q2（スタイル）→ 追加ジャンル
const Q2_MAP: Record<string, string[]> = {
  アクション派: ["Action", "Sports"],
  ストーリー派: ["Drama", "Mystery"],
  どっちも好き: [],
};

// Q3（話数）→ エピソード範囲
const Q3_MAP: Record<string, { min: number; max: number }> = {
  短め: { min: 1, max: 13 },
  スタンダード: { min: 12, max: 26 },
  長編OK: { min: 1, max: 9999 },
};

// ランダム年代を3つ選出（1990〜2026）
function pickRandomYears(count: number): number[] {
  const years: number[] = [];
  while (years.length < count) {
    const y = 1990 + Math.floor(Math.random() * 37); // 1990-2026
    if (!years.includes(y)) years.push(y);
  }
  return years;
}

// 話数フィルタ
function filterByEpisodes(
  works: AniListAnime[],
  range: { min: number; max: number },
): AniListAnime[] {
  return works.filter((w) => {
    const eps = w.episodes ?? 0;
    if (eps === 0) return true;
    return eps >= range.min && eps <= range.max;
  });
}

// idで重複除去
function dedup(works: AniListAnime[]): AniListAnime[] {
  const seen = new Set<number>();
  return works.filter((w) => {
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
}

// シャッフル（Fisher-Yates）
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q1 = searchParams.get("q1") ?? "";
    const q2 = searchParams.get("q2") ?? "";
    const q3 = searchParams.get("q3") ?? "";

    // ジャンル構築
    const q1Genres = Q1_MAP[q1] ?? ["Comedy"];
    const q2Genres = Q2_MAP[q2] ?? [];
    const genres = [...new Set([...q1Genres, ...q2Genres])];
    const range = Q3_MAP[q3] ?? { min: 1, max: 9999 };
    const randomYears = pickRandomYears(3);

    // 並列で4カテゴリを取得
    const [popular, midTier, hidden, ...yearResults] = await Promise.all([
      // 人気作（80点以上・人気順）
      searchAnimeByGenresAndScore(genres, 79, 100, {
        perPage: 15,
        sort: "POPULARITY_DESC",
      }),
      // 中堅作（65〜79点・スコア順）
      searchAnimeByGenresAndScore(genres, 64, 80, {
        perPage: 15,
        sort: "SCORE_DESC",
      }),
      // 隠れ名作（50〜64点・お気に入り順）
      searchAnimeByGenresAndScore(genres, 49, 65, {
        perPage: 10,
        sort: "FAVOURITES_DESC",
      }),
      // ランダム年代（各年から取得）
      ...randomYears.map((y) =>
        searchAnimeByGenresAndScore(q1Genres, 60, 100, {
          year: y,
          perPage: 5,
          sort: "SCORE_DESC",
        }),
      ),
    ]);

    // 話数フィルタ適用
    const filteredPopular = filterByEpisodes(popular, range).slice(0, 5);
    const filteredMid = filterByEpisodes(midTier, range).slice(0, 5);
    const filteredHidden = filterByEpisodes(hidden, range).slice(0, 3);
    const filteredYear = filterByEpisodes(
      yearResults.flat(),
      range,
    ).slice(0, 3);

    // マージ → 重複除去 → シャッフル → 最大16件
    const all = dedup([
      ...filteredPopular,
      ...filteredMid,
      ...filteredHidden,
      ...filteredYear,
    ]);
    const shuffled = shuffle(all).slice(0, 16);

    // レスポンス整形
    const results = shuffled.map((w) => ({
      id: w.id,
      title: w.title.native ?? `ID:${w.id}`,
      image: w.coverImage?.large ?? "",
      genres: w.genres,
      episodes: w.episodes ?? 0,
      score: w.averageScore ?? 0,
      seasonYear: w.seasonYear,
    }));

    return NextResponse.json({
      results,
      meta: {
        genres,
        q1,
        q2,
        q3,
        counts: {
          popular: filteredPopular.length,
          midTier: filteredMid.length,
          hidden: filteredHidden.length,
          yearPick: filteredYear.length,
          total: results.length,
        },
        randomYears,
      },
    });
  } catch (e) {
    console.error("Diagnosis API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch diagnosis results" },
      { status: 500 },
    );
  }
}

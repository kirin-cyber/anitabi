import { NextRequest, NextResponse } from "next/server";
import {
  searchAnimeByTitle,
  getAnimeByYear,
  getAnimeByYearRange,
} from "@/lib/anilist";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const year = searchParams.get("year");
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const page = Number(searchParams.get("page") ?? 1);

    if (search) {
      const results = await searchAnimeByTitle(search);
      return NextResponse.json({ results, search, page });
    }

    if (yearFrom && yearTo) {
      const results = await getAnimeByYearRange(
        Number(yearFrom),
        Number(yearTo),
        page,
      );
      return NextResponse.json({ results, yearFrom, yearTo, page });
    }

    const y = Number(year ?? 2024);
    const results = await getAnimeByYear(y, page);
    return NextResponse.json({ results, year: y, page });
  } catch (e) {
    console.error("AniList API route error:", e);
    return NextResponse.json(
      { error: "Failed to fetch from AniList" },
      { status: 500 },
    );
  }
}

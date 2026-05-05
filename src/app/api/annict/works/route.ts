import { NextRequest, NextResponse } from "next/server";
import { getSeasonWorks, getCurrentSeason, getNextSeason } from "@/lib/annict";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const seasonParam = searchParams.get("season");

    // season パラメータ: "current", "next", または直接指定 "2026-winter"
    let season: string;
    if (seasonParam === "next") {
      season = getNextSeason();
    } else if (seasonParam && seasonParam !== "current") {
      season = seasonParam;
    } else {
      season = getCurrentSeason();
    }

    const first = Number(searchParams.get("first") ?? 30);
    const works = await getSeasonWorks(season, first);

    return NextResponse.json({ season, works });
  } catch (e) {
    console.error("Annict API route error:", e);
    return NextResponse.json(
      { error: "Failed to fetch works" },
      { status: 500 },
    );
  }
}

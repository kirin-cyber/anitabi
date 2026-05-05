import { NextRequest, NextResponse } from "next/server";
import { searchAnimeByTitle } from "@/lib/anilist";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const results = await searchAnimeByTitle(title);
    if (results.length === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const top = results[0];
    return NextResponse.json({
      id: top.id,
      title: top.title.native ?? top.title.romaji,
    });
  } catch {
    return NextResponse.json({ error: "search failed" }, { status: 500 });
  }
}

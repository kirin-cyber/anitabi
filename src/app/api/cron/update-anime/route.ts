import { NextRequest, NextResponse } from "next/server";
import { getSeasonWorks, getCurrentSeason } from "@/lib/annict";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Vercel Cron Jobs または管理者からのリクエストのみ許可
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const season = getCurrentSeason();
    const works = await getSeasonWorks(season, 50);
    return NextResponse.json({
      ok: true,
      season,
      count: works.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSeasonWorks, getCurrentSeason } from "@/lib/annict";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const adminPassword = process.env.ADMIN_PASSWORD;
  const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isAdmin = adminPassword && request.headers.get("x-admin-password") === adminPassword;

  if (!isVercelCron && !isAdmin) {
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
    console.error("Cron update error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

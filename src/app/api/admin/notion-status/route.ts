import { NextRequest, NextResponse } from "next/server";
import { getVoiceActors } from "@/lib/notion";

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vas = await getVoiceActors();
    const withDesc = vas.filter((v) => v.description && v.description.length > 0);
    return NextResponse.json({
      total: vas.length,
      withDescription: withDesc.length,
      withoutDescription: vas.length - withDesc.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

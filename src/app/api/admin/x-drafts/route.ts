import { NextRequest, NextResponse } from "next/server";
import { getAnimeBySeason } from "@/lib/anilist";
import { getVoiceActors } from "@/lib/notion";

function currentSeason(): { year: number; season: "WINTER" | "SPRING" | "SUMMER" | "FALL" } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const season =
    month <= 3 ? "WINTER" : month <= 6 ? "SPRING" : month <= 9 ? "SUMMER" : "FALL";
  return { year: now.getFullYear(), season };
}

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { year, season } = currentSeason();
  const seasonLabel: Record<string, string> = { WINTER: "冬", SPRING: "春", SUMMER: "夏", FALL: "秋" };

  const [animeList, voiceActors] = await Promise.allSettled([
    getAnimeBySeason(year, season, 1),
    getVoiceActors(),
  ]);

  const anime =
    animeList.status === "fulfilled"
      ? [...animeList.value].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0)).slice(0, 3)
      : [];

  const vas = voiceActors.status === "fulfilled" ? voiceActors.value : [];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const dailyVA = vas.length > 0 ? vas[dayOfYear % vas.length] : null;

  const drafts = [
    {
      id: "anime-pickup",
      label: "今季アニメPickup",
      texts: anime.map((a) => ({
        animeId: a.id,
        text: `【${year}年${seasonLabel[season]}アニメPickup】\n${a.title.native ?? a.title.romaji ?? ""}\n\nスコア ⭐${a.averageScore ?? "??"}/100\n\n詳細・配信サービスはこちら👇\nhttps://anitabi.site/anime/${a.id}\n\n#アニメ #${year}年アニメ`,
      })),
    },
    {
      id: "va-intro",
      label: "声優紹介",
      texts: dailyVA
        ? [
            {
              animeId: null,
              text: `【声優紹介】${dailyVA.name}さん🎤\n\n${dailyVA.description?.slice(0, 80) ?? ""}\n\nプロフィール・出演作品はこちら👇\nhttps://anitabi.site/voice-actors/${dailyVA.id}\n\n#声優 #アニメ`,
            },
          ]
        : [],
    },
    {
      id: "diagnosis-promo",
      label: "診断プロモ",
      texts: [
        {
          animeId: null,
          text: `あなたにぴったりのアニメ、わかる？🎯\n\n「笑いたい？泣きたい？癒されたい？」\n3問に答えるだけでおすすめ作品がわかります✨\n\n👇無料で診断する\nhttps://anitabi.site/diagnosis\n\n#アニメ診断 #アニメおすすめ #アニメ好きと繋がりたい`,
        },
      ],
    },
  ];

  return NextResponse.json({ drafts });
}

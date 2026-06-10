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
      texts: anime.map((a) => {
        const title = a.title.native ?? a.title.romaji ?? "（タイトル不明）";
        const score = a.averageScore ?? "??";
        return {
          animeId: a.id,
          text: `${title}、観た？👀\n\n今季スコア${score}点でじわじわ話題になってる作品。\nどこで配信してるかAniTabiでまとめて確認できるよ👇\n\nhttps://anitabi.site/anime/${a.id}\n\n#アニメ好きと繋がりたい #${year}年${seasonLabel[season]}アニメ`,
        };
      }),
    },
    {
      id: "va-intro",
      label: "声優紹介",
      texts: dailyVA
        ? [
            {
              animeId: null,
              text: `${dailyVA.name}さんの声、絶対どこかで聞いたことある🎤\n\n${dailyVA.description?.slice(0, 60) ?? ""}…\n\n出演作品まとめたよ👇\nhttps://anitabi.site/voice-actors/${dailyVA.id}\n\n#声優 #アニメ好きと繋がりたい`,
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
          text: `最近ハマれるアニメ探してる人へ🎯\n\n3問答えるだけでぴったりの作品がわかる診断つくった。\n所要時間1分もかからないよ\n\n👇やってみて\nhttps://anitabi.site/diagnosis\n\n#アニメ #アニメ診断 #アニメ好きと繋がりたい`,
        },
      ],
    },
  ];

  return NextResponse.json({ drafts });
}

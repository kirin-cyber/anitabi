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
      texts: anime.map((a, i) => {
        const title = (a.title.native || a.title.romaji || "このアニメ");
        const score = a.averageScore ?? "??";
        const genres = a.genres.slice(0, 2).join(" / ");
        const url = `https://anitabi.site/anime/${a.id}`;
        const season2 = `${year}年${seasonLabel[season]}アニメ`;
        const patterns = [
          `${title}、今季イチ好きかもしれない\n\nジャンル：${genres}\nスコア：${score}点\n\n配信サービスはAniTabiで確認できるよ👇\n${url}\n\n#アニメ好きと繋がりたい #${season2}`,
          `今季アニメ迷ってる人に${title}を推したい\n\nスコア${score}点。ジャンルは${genres}。\n1話だけでも観てみて👇\n${url}\n\n#${season2} #アニメ`,
          `「${title}ってどこで観られる？」ってなってた人へ\n\nAniTabiにまとめたよ。スコア${score}点の今季注目作品\n\n${url}\n\n#アニメ好きと繋がりたい #${season2}`,
        ];
        return { animeId: a.id, text: patterns[i % patterns.length] };
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AnimeImage from "@/components/AnimeImage";
import Breadcrumb from "@/components/Breadcrumb";

interface DiagnosisResult {
  id: number;
  title: string;
  image: string;
  genres: string[];
  episodes: number;
  score: number;
  seasonYear: number | null;
}

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function buildDiagParams(params: Record<string, string | undefined>): URLSearchParams {
  const p = new URLSearchParams();
  if (params.q1) p.set("q1", params.q1);
  if (params.q2) p.set("q2", params.q2);
  if (params.q3) p.set("q3", params.q3);
  if (params.mode === "full") {
    p.set("mode", "full");
    if (params.q4) p.set("q4", params.q4);
    if (params.q5) p.set("q5", params.q5);
    if (params.q6) p.set("q6", params.q6);
    if (params.q7) p.set("q7", params.q7);
  }
  return p;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const moodLabel: Record<string, string> = {
    笑いたい: "笑える",
    泣きたい: "泣ける",
    ドキドキしたい: "ドキドキ",
    ゾクゾクしたい: "ゾクゾク",
    癒されたい: "癒し系",
  };
  const mood = params.q1 ? (moodLabel[params.q1] ?? params.q1) : "";
  const title = `${mood ? mood + "系 " : ""}アニメ診断結果 - AniTabi`;
  const description = "AniTabiのアニメ診断結果。あなたにぴったりのアニメが見つかりました！";
  const diagParams = buildDiagParams(params);
  const ogImageUrl = `https://anitabi.site/api/og/diagnosis?${diagParams}`;
  const resultUrl = `https://anitabi.site/diagnosis/result?${diagParams}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: resultUrl,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function DiagnosisResultPage({ searchParams }: Props) {
  const params = await searchParams;
  const diagParams = buildDiagParams(params);

  if (!params.q1) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <p className="text-text-sub mb-4">診断結果がありません</p>
            <Link
              href="/diagnosis"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white"
            >
              診断する
            </Link>
          </div>
        </main>
      </>
    );
  }

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://anitabi.site";

  const res = await fetch(`${baseUrl}/api/diagnosis?${diagParams}`, {
    cache: "no-store",
  });

  if (!res.ok) notFound();

  const data = await res.json();
  const results: DiagnosisResult[] = data.results ?? [];
  const resultUrl = `https://anitabi.site/diagnosis/result?${diagParams}`;
  const shareText = encodeURIComponent(
    `AniTabiでアニメ診断したら${results[0]?.title ?? "おすすめ作品"}が1位でした！あなたもやってみて👇`
  );
  const xShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(resultUrl)}&hashtags=アニメ診断,AniTabi`;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Breadcrumb
            items={[
              { label: "診断", href: "/diagnosis" },
              { label: "結果", href: `/diagnosis/result?${diagParams}` },
            ]}
          />

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              あなたへのおすすめ{" "}
              <span className="text-accent">{results.length}</span> 作品
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {results.map((anime, i) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="group overflow-hidden rounded-xl border border-text-sub/15 bg-card transition-colors hover:border-accent/50"
              >
                <div className="flex">
                  <div className="h-32 w-24 shrink-0 overflow-hidden bg-background sm:w-28">
                    <AnimeImage
                      src={anime.image}
                      alt={anime.title}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex-1 p-3 sm:p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {anime.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="rounded-full bg-gray-500 px-2 py-0.5 text-[10px] font-medium text-white"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold leading-snug text-text-main transition-colors group-hover:text-accent">
                      {anime.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-sub">
                      {anime.episodes > 0 && <span>全{anime.episodes}話</span>}
                      {anime.seasonYear && <span>{anime.seasonYear}年</span>}
                    </div>
                    {anime.score > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${anime.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-accent">
                          {anime.score}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Xシェアボタン */}
          <div className="mt-8 flex justify-center">
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              結果をXでシェア
            </a>
          </div>

          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/diagnosis"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white transition-opacity hover:opacity-90"
            >
              もう一度診断する
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-text-sub/20 bg-background-secondary/50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-6 text-center text-xs text-text-sub">
          <p>
            &copy; 2026{" "}
            <span className="font-bold text-text-main">AniTabi</span> by kirin
          </p>
        </div>
      </footer>
    </>
  );
}

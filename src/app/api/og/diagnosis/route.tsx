import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface DiagnosisResult {
  id: number;
  title: string;
}

async function loadNotoSansJP(): Promise<ArrayBuffer> {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700",
    { headers: { "User-Agent": "Mozilla/5.0" } }
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format/)?.[1];
  if (!url) throw new Error("Noto Sans JP font URL not found");
  return fetch(url).then((r) => r.arrayBuffer());
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q1 = searchParams.get("q1") ?? "";
  const q2 = searchParams.get("q2") ?? "";
  const q3 = searchParams.get("q3") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const q4 = searchParams.get("q4") ?? "";
  const q5 = searchParams.get("q5") ?? "";
  const q6 = searchParams.get("q6") ?? "";
  const q7 = searchParams.get("q7") ?? "";

  const diagParams = new URLSearchParams({ q1, q2, q3 });
  if (mode === "full") {
    diagParams.set("mode", "full");
    if (q4) diagParams.set("q4", q4);
    if (q5) diagParams.set("q5", q5);
    if (q6) diagParams.set("q6", q6);
    if (q7) diagParams.set("q7", q7);
  }

  let titles: string[] = [];
  try {
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/diagnosis?${diagParams}`, {
      cache: "no-store",
    });
    const data = await res.json();
    titles = ((data.results ?? []) as DiagnosisResult[])
      .slice(0, 3)
      .map((r) => r.title);
  } catch {
    titles = [];
  }

  const moodLabel: Record<string, string> = {
    笑いたい: "笑える",
    泣きたい: "泣ける",
    ドキドキしたい: "ドキドキ",
    ゾクゾクしたい: "ゾクゾク",
    癒されたい: "癒し系",
  };
  const headline = q1 ? `${moodLabel[q1] ?? q1}アニメ診断結果` : "アニメ診断結果";

  let fontData: ArrayBuffer | undefined;
  try {
    fontData = await loadNotoSansJP();
  } catch {
    // フォント取得失敗時はシステムフォントにフォールバック
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060c1c",
          padding: "56px 72px",
          fontFamily: "NotoSansJP, sans-serif",
        }}
      >
        {/* ロゴ */}
        <div style={{ display: "flex", marginBottom: "20px" }}>
          <span style={{ color: "#534AB7", fontSize: 32, fontWeight: 700 }}>Ani</span>
          <span style={{ color: "#dce8ff", fontSize: 32, fontWeight: 700 }}>Tabi</span>
        </div>

        {/* ヘッドライン */}
        <div
          style={{
            color: "#dce8ff",
            fontSize: 48,
            fontWeight: 700,
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          🎯 {headline}
        </div>

        {/* 作品リスト */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
          }}
        >
          {titles.length > 0 ? (
            titles.map((title, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  backgroundColor: "rgba(83,74,183,0.15)",
                  borderRadius: "12px",
                  padding: "18px 28px",
                  border: "1px solid rgba(83,74,183,0.35)",
                }}
              >
                <span
                  style={{
                    color: "#534AB7",
                    fontSize: 28,
                    fontWeight: 700,
                    minWidth: "36px",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "#dce8ff", fontSize: 26, fontWeight: 600 }}>
                  {title}
                </span>
              </div>
            ))
          ) : (
            <div
              style={{
                color: "#7a90bc",
                fontSize: 24,
                textAlign: "center",
              }}
            >
              診断してあなたにぴったりのアニメを見つけよう
            </div>
          )}
        </div>

        {/* フッター */}
        <div style={{ color: "#7a90bc", fontSize: 20, marginTop: "36px" }}>
          anitabi.site でアニメを探そう
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: "NotoSansJP", data: fontData, style: "normal" as const }]
        : [],
    }
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import DiagnosisWizard from "@/components/DiagnosisWizard";

export const metadata: Metadata = {
  title: "アニメ診断 無料｜おすすめアニメを見つける - AniTabi",
  description: "3つの質問に答えるだけで、あなたにぴったりのおすすめアニメが無料でわかる！サクッとモード・ガチモード対応。",
  openGraph: {
    title: "アニメ診断 無料｜おすすめアニメを見つける - AniTabi",
    description: "3つの質問に答えるだけで、あなたにぴったりのおすすめアニメが無料でわかる！サクッとモード・ガチモード対応。",
    url: "https://anitabi.site/diagnosis",
    type: "website",
  },
};

export default function DiagnosisPage() {
  return (
    <>
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-text-sub/20 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-accent">Ani</span>
            <span className="text-text-main">Tabi</span>
          </Link>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
            サクッと診断
          </span>
        </div>
      </header>

      <main className="flex-1">
        <DiagnosisWizard />
      </main>

      {/* フッター */}
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

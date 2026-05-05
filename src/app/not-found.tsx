import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-8xl">🔭</p>
        <h1 className="mt-6 text-3xl font-bold md:text-4xl">
          ページが見つかりません
        </h1>
        <p className="mt-3 max-w-md text-text-sub">
          お探しのページは存在しないか、移動した可能性があります。
          <br />
          URLをご確認の上、もう一度お試しください。
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 font-bold text-white transition-opacity hover:opacity-90"
          >
            トップに戻る
          </Link>
          <Link
            href="/anime"
            className="inline-flex h-12 items-center justify-center rounded-full border border-text-sub/30 px-8 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
          >
            アニメ一覧を見る
          </Link>
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

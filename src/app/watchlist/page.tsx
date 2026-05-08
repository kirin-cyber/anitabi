import type { Metadata } from "next";
import Header from "@/components/Header";
import WatchlistContent from "@/components/WatchlistContent";

export const metadata: Metadata = {
  title: "マイリスト - AniTabi",
  description: "お気に入り・視聴ステータス管理",
};

export default function WatchlistPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
              ❤️ マイリスト
            </h1>
            <p className="mt-1 text-sm text-text-sub">
              お気に入り登録・視聴ステータス管理（端末に保存）
            </p>
          </div>
          <WatchlistContent />
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

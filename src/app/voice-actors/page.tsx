import type { Metadata } from "next";
import Header from "@/components/Header";
import VoiceActorFilter from "@/components/VoiceActorFilter";
import { getVoiceActors } from "@/lib/notion";

export const metadata: Metadata = {
  title: "声優一覧｜プロフィール・代表作 - AniTabi",
  description: "人気声優100名以上のプロフィール・代表作をチェック。今季出演中の声優やレジェンド声優をランク別に検索できます。",
  openGraph: {
    title: "声優一覧｜プロフィール・代表作 - AniTabi",
    description: "人気声優100名以上のプロフィール・代表作をチェック。今季出演中の声優やレジェンド声優をランク別に検索できます。",
    url: "https://anitabi.site/voice-actors",
    type: "website",
  },
};

export default async function VoiceActorsPage() {
  const voiceActors = await getVoiceActors();

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">声優一覧</h1>
            <p className="mt-1 text-sm text-text-sub">
              今季出演中の声優やレジェンド声優をチェック
            </p>
          </div>

          <VoiceActorFilter voiceActors={voiceActors} />
        </section>
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

import type { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ - AniTabi",
  description: "AniTabiへのお問い合わせはこちらから。",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="mb-8 text-2xl font-bold md:text-3xl">
            お問い合わせ
          </h1>

          <div className="space-y-6 text-sm leading-relaxed text-text-main">
            <p>
              AniTabi（以下「当サイト」）へのお問い合わせは、以下のメールアドレスまでご連絡ください。
            </p>

            <div className="rounded-xl border border-text-sub/15 bg-card p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-text-sub">運営者</p>
                  <p className="mt-1 font-medium">kirin</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-sub">メールアドレス</p>
                  <p className="mt-1">
                    <a
                      href="mailto:kirin9867+ani@gmail.com"
                      className="font-medium text-accent hover:underline"
                    >
                      kirin9867+ani@gmail.com
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-sub">サイトURL</p>
                  <p className="mt-1 font-medium">https://anitabi.jp（予定）</p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="mb-2 text-lg font-bold">
                お問い合わせの際のお願い
              </h2>
              <ul className="ml-4 list-disc space-y-2 text-text-sub">
                <li>
                  件名に「AniTabi」と記載いただけると対応がスムーズです
                </li>
                <li>
                  お問い合わせ内容によっては、回答にお時間をいただく場合があります
                </li>
                <li>
                  営利目的の勧誘・広告メールはご遠慮ください
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">対応可能なお問い合わせ</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-text-sub/15 bg-card p-4">
                  <p className="font-bold">サイトの不具合報告</p>
                  <p className="mt-1 text-xs text-text-sub">
                    表示崩れ・リンク切れ等
                  </p>
                </div>
                <div className="rounded-xl border border-text-sub/15 bg-card p-4">
                  <p className="font-bold">掲載情報の修正依頼</p>
                  <p className="mt-1 text-xs text-text-sub">
                    誤った作品情報・声優情報等
                  </p>
                </div>
                <div className="rounded-xl border border-text-sub/15 bg-card p-4">
                  <p className="font-bold">著作権に関するご連絡</p>
                  <p className="mt-1 text-xs text-text-sub">
                    画像・コンテンツの削除要請等
                  </p>
                </div>
                <div className="rounded-xl border border-text-sub/15 bg-card p-4">
                  <p className="font-bold">その他ご意見・ご要望</p>
                  <p className="mt-1 text-xs text-text-sub">
                    機能リクエスト・感想等
                  </p>
                </div>
              </div>
            </section>

            <p className="pt-4 text-text-sub">制定日: 2026年3月31日</p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-full border border-text-sub/30 px-6 text-sm text-text-sub transition-colors hover:border-accent hover:text-text-main"
            >
              ← トップに戻る
            </Link>
          </div>
        </article>
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

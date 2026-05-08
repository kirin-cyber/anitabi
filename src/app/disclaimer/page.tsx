import type { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "免責事項 - AniTabi",
  description: "AniTabiの免責事項について。",
};

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="mb-8 text-2xl font-bold md:text-3xl">免責事項</h1>

          <div className="space-y-6 text-sm leading-relaxed text-text-main">
            <p>
              AniTabi（以下「当サイト」）における免責事項を以下に定めます。当サイトをご利用いただく際は、本免責事項の内容をご了承の上でご利用ください。
            </p>

            <section>
              <h2 className="mb-2 text-lg font-bold">1. 情報の正確性について</h2>
              <p>
                当サイトに掲載されているアニメ作品情報・声優情報・配信情報等は、外部API（Annict
                API、AniList
                API等）から取得した情報をもとに表示しています。情報の正確性・完全性・最新性について保証するものではありません。
              </p>
              <p className="mt-2">
                最新かつ正確な情報については、各公式サイトをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">2. 損害等の責任について</h2>
              <p>
                当サイトの利用により生じた損害等について、当サイトは一切の責任を負いません。また、当サイトからリンクやバナーにより他のサイトに移動された場合、移動先サイトで提供される情報・サービス等についても一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">3. 診断機能について</h2>
              <p>
                当サイトで提供するアニメ診断機能は、エンターテインメント目的で作成されたものです。診断結果はあくまで参考情報であり、すべてのユーザーに最適な作品を保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">
                4. 著作権・商標について
              </h2>
              <p>
                当サイトに掲載されているアニメ作品の画像・ロゴ・作品名等の著作権・商標権はそれぞれの権利者に帰属します。当サイトは紹介を目的として使用しており、著作権等の侵害を意図するものではありません。
              </p>
              <p className="mt-2">
                権利者の方で掲載に問題がある場合は、お問い合わせよりご連絡ください。速やかに対応いたします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">
                5. サービスの変更・停止について
              </h2>
              <p>
                当サイトは、事前の予告なくサービスの内容を変更、または停止する場合があります。これにより生じた損害について、当サイトは一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">6. お問い合わせ</h2>
              <div className="mt-2 rounded-xl border border-text-sub/15 bg-card p-4 text-text-sub">
                <p>運営者: kirin</p>
                <p>サイトURL: https://anitabi.site</p>
                <p>
                  メール:{" "}
                  <a
                    href="mailto:kirin9867+ani@gmail.com"
                    className="text-accent hover:underline"
                  >
                    kirin9867+ani@gmail.com
                  </a>
                </p>
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

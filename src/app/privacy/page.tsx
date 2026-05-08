import type { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー - AniTabi",
  description: "AniTabiのプライバシーポリシーについて。",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="mb-8 text-2xl font-bold md:text-3xl">
            プライバシーポリシー
          </h1>

          <div className="space-y-6 text-sm leading-relaxed text-text-main">
            <p>
              AniTabi（以下「当サイト」）は、ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
            </p>

            <section>
              <h2 className="mb-2 text-lg font-bold">1. 個人情報の収集について</h2>
              <p>
                当サイトでは、お問い合わせの際に、お名前・メールアドレス等の個人情報をご提供いただく場合があります。これらの情報は、お問い合わせへの回答および必要な連絡のためにのみ使用いたします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">2. アクセス解析ツールについて</h2>
              <p>
                当サイトでは、Googleによるアクセス解析ツール「Google
                Analytics」を使用しています。Google
                Analyticsはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
              </p>
              <p className="mt-2">
                この機能はCookieを無効にすることで収集を拒否できますので、お使いのブラウザの設定をご確認ください。Google
                Analyticsの利用規約については、Google
                Analyticsのサイトをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">3. 広告について</h2>
              <p>
                当サイトでは、将来的に第三者配信の広告サービスを利用する場合があります。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">
                4. 個人情報の第三者提供について
              </h2>
              <p>
                当サイトは、以下の場合を除き、収集した個人情報を第三者に提供することはありません。
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-text-sub">
                <li>ご本人の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>
                  人の生命、身体または財産の保護のために必要がある場合であって、ご本人の同意を得ることが困難な場合
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">5. 免責事項</h2>
              <p>
                当サイトに掲載されている情報の正確性には万全を期していますが、利用者が当サイトの情報を用いて行う一切の行為について、当サイトは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">
                6. プライバシーポリシーの変更
              </h2>
              <p>
                当サイトは、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold">7. お問い合わせ</h2>
              <p>
                本ポリシーに関するお問い合わせは、下記までご連絡ください。
              </p>
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

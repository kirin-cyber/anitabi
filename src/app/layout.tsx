import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anitabi.site"),
  title: "AniTabi - あなたにぴったりのアニメを見つけよう",
  description: "ジャンル診断・声優検索・最新アニメ情報をまとめたアニメ紹介サイト",
  openGraph: {
    siteName: "AniTabi",
    locale: "ja_JP",
    type: "website",
  },
  verification: {
    google: "de-XKYq7ytULA9UcwYfWcldQ2AnWRQeM40RMlv1oJgs",
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const isProd = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {isProd && gaId && <GoogleAnalytics gaId={gaId} />}
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

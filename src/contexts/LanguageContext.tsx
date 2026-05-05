"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Locale = "ja" | "en";

const TRANSLATIONS = {
  ja: {
    nav: {
      home: "ホーム",
      anime: "アニメ一覧",
      diagnosis: "診断",
      voiceActors: "声優",
      news: "最新情報",
    },
    home: {
      tagline1: "あなたにぴったりの",
      tagline2: "アニメを見つけよう",
      subtitle: "ジャンル診断で好みのアニメをサクッと発見。声優情報や最新アニメもまとめてチェック。",
      diagnosisBtn: "無料で診断する",
      animeListBtn: "アニメ一覧を見る",
      genreTitle: "ジャンルから探す",
      featuredTitle: "🔥 今季の注目作品",
      gridTitle: "2026年春 放送中アニメ一覧",
      moreBtn: "もっと見る → アニメ一覧へ",
    },
    media: {
      tv: "TVアニメ",
      ova: "OVA",
      movie: "劇場版",
      web: "Web",
      episodes: "全{n}話",
      season: "2026春",
    },
    footer: {
      privacy: "プライバシーポリシー",
      disclaimer: "免責事項",
      contact: "お問い合わせ",
    },
  },
  en: {
    nav: {
      home: "Home",
      anime: "Anime List",
      diagnosis: "Quiz",
      voiceActors: "Voice Actors",
      news: "News",
    },
    home: {
      tagline1: "Find the perfect",
      tagline2: "anime for you",
      subtitle: "Discover anime you love with our genre quiz. Check voice actor info and the latest news.",
      diagnosisBtn: "Take the Quiz",
      animeListBtn: "Browse Anime",
      genreTitle: "Browse by Genre",
      featuredTitle: "🔥 Featured Anime",
      gridTitle: "Spring 2026 Airing Anime",
      moreBtn: "View All → Anime List",
    },
    media: {
      tv: "TV Anime",
      ova: "OVA",
      movie: "Movie",
      web: "Web",
      episodes: "{n} eps",
      season: "Spring 2026",
    },
    footer: {
      privacy: "Privacy Policy",
      disclaimer: "Disclaimer",
      contact: "Contact",
    },
  },
} as const;

type Translations = typeof TRANSLATIONS.ja;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (namespace: keyof Translations, key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "ja",
  setLocale: () => {},
  t: (ns, key) => (TRANSLATIONS.ja[ns] as Record<string, string>)[key] ?? key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja");

  useEffect(() => {
    const saved = localStorage.getItem("anitabi-lang") as Locale | null;
    if (saved === "ja" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("anitabi-lang", l);
  };

  const t = (namespace: keyof Translations, key: string): string => {
    const ns = TRANSLATIONS[locale][namespace] as Record<string, string>;
    return ns[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

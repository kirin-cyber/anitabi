"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type Locale, TRANSLATIONS } from "@/lib/translations";

export type { Locale };

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
    document.cookie = `anitabi-lang=${l};path=/;max-age=31536000;SameSite=Lax`;
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

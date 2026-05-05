"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-text-sub/20 p-0.5 text-xs font-bold">
      <button
        onClick={() => setLocale("ja")}
        className={`rounded-full px-2 py-0.5 transition-colors ${
          locale === "ja"
            ? "bg-accent text-white"
            : "text-text-sub hover:text-text-main"
        }`}
      >
        JP
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`rounded-full px-2 py-0.5 transition-colors ${
          locale === "en"
            ? "bg-accent text-white"
            : "text-text-sub hover:text-text-main"
        }`}
      >
        EN
      </button>
    </div>
  );
}

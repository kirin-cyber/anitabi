import { cookies } from "next/headers";
import { type Locale, TRANSLATIONS } from "@/lib/translations";

export type { Locale };

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("anitabi-lang")?.value;
  return lang === "en" ? "en" : "ja";
}

export function getT(locale: Locale) {
  return (namespace: keyof typeof TRANSLATIONS.ja, key: string): string => {
    const ns = TRANSLATIONS[locale][namespace] as Record<string, string>;
    return ns[key] ?? key;
  };
}

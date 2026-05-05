"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/", label: t("nav", "home") },
    { href: "/anime", label: t("nav", "anime") },
    { href: "/diagnosis", label: t("nav", "diagnosis") },
    { href: "/voice-actors", label: t("nav", "voiceActors") },
    { href: "/news", label: t("nav", "news") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-text-sub/20 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-accent">Ani</span>
          <span className="text-text-main">Tabi</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-sub transition-colors hover:text-text-main"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}

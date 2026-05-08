"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/", label: t("nav", "home") },
    { href: "/anime", label: t("nav", "anime") },
    { href: "/schedule", label: t("nav", "schedule") },
    { href: "/ranking", label: t("nav", "ranking") },
    { href: "/diagnosis", label: t("nav", "diagnosis") },
    { href: "/voice-actors", label: t("nav", "voiceActors") },
    { href: "/news", label: t("nav", "news") },
    { href: "/watchlist", label: t("nav", "watchlist") },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="メニュー"
        className="p-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-6 w-6"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="absolute left-0 top-full w-full border-t border-text-sub/20 bg-background px-4 py-4">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-text-main transition-colors hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

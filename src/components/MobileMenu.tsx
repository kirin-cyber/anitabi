"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="メニュー"
        aria-expanded={open}
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

      {/* 背景オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* スライドインメニュー */}
      <nav
        className={`absolute left-0 top-full z-50 w-full border-t border-text-sub/20 bg-background px-4 py-4 transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block text-text-main transition-colors hover:text-accent"
                onClick={close}
                tabIndex={open ? 0 : -1}
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
    </div>
  );
}

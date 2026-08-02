#!/usr/bin/env node
/**
 * AniTabi X投稿文生成スクリプト
 * 使い方: npx tsx --env-file=.env.local scripts/generate-tweet.ts --type [monday|wednesday|friday]
 */

import { readFileSync } from "fs";
import { join } from "path";

// .env.local を手動ロード（--env-file が使えない環境向けフォールバック）
function loadEnv() {
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch { /* .env.local なし */ }
}
loadEnv();

// ========== 定数 ==========

const ANILIST_URL = "https://graphql.anilist.co";
const ANNICT_URL  = "https://api.annict.com/graphql";
const NOTION_URL  = "https://api.notion.com/v1";

const HASHTAGS = {
  jp: "#アニメ #アニメ好きと繋がりたい #AniTabi",
  en: "#anime #animelovers #AniTabi",
};

const SITE_URL = "https://anitabi.site";

// ========== ユーティリティ ==========

function getCurrentSeason(): { season: "WINTER" | "SPRING" | "SUMMER" | "FALL"; year: number } {
  const m = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (m <= 3) return { season: "WINTER", year };
  if (m <= 6) return { season: "SPRING", year };
  if (m <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

function seasonLabel(season: string, lang: "jp" | "en"): string {
  if (lang === "en") {
    return { WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" }[season] ?? season;
  }
  return { WINTER: "冬", SPRING: "春", SUMMER: "夏", FALL: "秋" }[season] ?? season;
}

function box(label: string, text: string) {
  const line = "─".repeat(50);
  console.log(`\n┌${line}┐`);
  console.log(`│  ${label.padEnd(48)}│`);
  console.log(`├${line}┤`);
  text.split("\n").forEach(l => console.log(`│ ${l.padEnd(49)}│`));
  console.log(`└${line}┘`);
}

// ========== Monday: 今週の注目アニメ ==========

interface AniListAnime {
  id: number;
  title: { native: string | null; romaji: string | null; english: string | null };
  averageScore: number | null;
  genres: string[];
  episodes: number | null;
}

async function fetchTopAnime(): Promise<AniListAnime[]> {
  const { season, year } = getCurrentSeason();
  const query = `
    query($season: MediaSeason, $year: Int) {
      Page(perPage: 10) {
        media(season: $season, seasonYear: $year, type: ANIME, format: TV,
              sort: SCORE_DESC, isAdult: false, averageScore_greater: 60) {
          id
          title { native romaji english }
          averageScore
          genres
          episodes
        }
      }
    }
  `;
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { season, year } }),
  });
  const json = await res.json();
  return (json.data?.Page?.media ?? []) as AniListAnime[];
}

async function generateMonday() {
  const { season, year } = getCurrentSeason();
  const anime = await fetchTopAnime();
  const top3 = anime.filter(a => a.averageScore).slice(0, 3);

  if (top3.length === 0) {
    console.log("⚠️  アニメデータを取得できませんでした");
    return;
  }

  // JP版
  const jpLines = [
    `🌟 今週の注目アニメ3選 [${year}年${seasonLabel(season, "jp")}] 🌟`,
    "",
    ...top3.map((a, i) => {
      const title = a.title.native ?? a.title.romaji ?? "不明";
      const score = a.averageScore ? `★${a.averageScore}` : "";
      const genre = a.genres.slice(0, 2).join("・");
      return `${["1️⃣","2️⃣","3️⃣"][i]} ${title}\n${genre}${score ? " " + score : ""}`;
    }),
    "",
    `詳しくはこちら👇\n${SITE_URL}`,
    "",
    HASHTAGS.jp,
  ];

  // EN版
  const enLines = [
    `🌟 This Week's Top 3 Anime [${seasonLabel(season, "en")} ${year}] 🌟`,
    "",
    ...top3.map((a, i) => {
      const title = a.title.english ?? a.title.romaji ?? a.title.native ?? "Unknown";
      const score = a.averageScore ? `★${a.averageScore}` : "";
      const genre = a.genres.slice(0, 2).join(" / ");
      return `${["1️⃣","2️⃣","3️⃣"][i]} ${title}\n${genre}${score ? " " + score : ""}`;
    }),
    "",
    `Check it out 👇\n${SITE_URL}`,
    "",
    HASHTAGS.en,
  ];

  box("🗓️  月曜投稿 — JP版", jpLines.join("\n"));
  box("🗓️  Monday Post — EN version", enLines.join("\n"));
}

// ========== Wednesday: 声優ピックアップ ==========

async function fetchRandomVoiceActor() {
  const token = process.env.NOTION_TOKEN;
  const dbId  = process.env.NOTION_VOICE_ACTORS_DB_ID;
  if (!token || !dbId) throw new Error("NOTION_TOKEN or NOTION_VOICE_ACTORS_DB_ID not set");

  const res = await fetch(`${NOTION_URL}/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 100 }),
  });
  const json = await res.json();
  const pages = json.results ?? [];
  if (pages.length === 0) throw new Error("No voice actors found");

  // ランダム選択
  const page = pages[Math.floor(Math.random() * pages.length)] as Record<string, unknown>;
  const props = page.properties as Record<string, Record<string, unknown>>;

  const getText = (key: string) =>
    ((props[key]?.rich_text as Array<{plain_text: string}>) ?? []).map(t => t.plain_text).join("") ||
    ((props[key]?.title as Array<{plain_text: string}>) ?? []).map(t => t.plain_text).join("");
  const getNum = (key: string) => (props[key]?.number as number) ?? 0;

  return {
    name: getText("名前") || getText("Name") || "不明",
    nameEn: getText("英語名") || getText("NameEn") || "",
    debutYear: getNum("デビュー年"),
    agency: getText("事務所"),
    description: getText("説明") || getText("Description"),
    notableRoles: getText("代表作") || getText("NotableRoles"),
    xUrl: (props["X URL"]?.url as string) ?? null,
  };
}

async function generateWednesday() {
  const va = await fetchRandomVoiceActor();
  const yearsActive = va.debutYear > 0 ? new Date().getFullYear() - va.debutYear : null;
  const roleText = va.notableRoles || va.description;

  // JP版
  const jpLines = [
    `🎤 今週の声優ピックアップ`,
    "",
    `✨ ${va.name}${va.nameEn ? ` (${va.nameEn})` : ""}`,
    ...(va.debutYear > 0 ? [`📅 デビュー: ${va.debutYear}年${yearsActive ? `（活動${yearsActive}年）` : ""}`] : []),
    ...(va.agency ? [`🏢 ${va.agency}`] : []),
    ...(roleText ? ["", "🎭 代表作", roleText.slice(0, 80)] : []),
    "",
    `もっと知る👇\n${SITE_URL}/voice-actors`,
    "",
    HASHTAGS.jp,
  ];

  // EN版
  const enLines = [
    `🎤 Voice Actor Spotlight of the Week`,
    "",
    `✨ ${va.nameEn || va.name}`,
    ...(va.debutYear > 0 ? [`📅 Debut: ${va.debutYear}${yearsActive ? ` (${yearsActive} yrs active)` : ""}`] : []),
    ...(va.agency ? [`🏢 ${va.agency}`] : []),
    ...(roleText ? ["", "🎭 Notable Roles", roleText.slice(0, 80)] : []),
    "",
    `Learn more 👇\n${SITE_URL}/voice-actors`,
    "",
    HASHTAGS.en,
  ];

  box("🗓️  水曜投稿 — JP版", jpLines.join("\n"));
  box("🗓️  Wednesday Post — EN version", enLines.join("\n"));
}

// ========== Friday: 今季ランキングTOP5 ==========

async function fetchRankingTop5(): Promise<AniListAnime[]> {
  const { season, year } = getCurrentSeason();
  const query = `
    query($season: MediaSeason, $year: Int) {
      Page(perPage: 5) {
        media(season: $season, seasonYear: $year, type: ANIME, format: TV,
              sort: POPULARITY_DESC, isAdult: false) {
          id
          title { native romaji english }
          averageScore
          genres
          episodes
        }
      }
    }
  `;
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { season, year } }),
  });
  const json = await res.json();
  return (json.data?.Page?.media ?? []) as AniListAnime[];
}

async function generateFriday() {
  const { season, year } = getCurrentSeason();
  const ranking = await fetchRankingTop5();

  if (ranking.length === 0) {
    console.log("⚠️  ランキングデータを取得できませんでした");
    return;
  }

  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];

  // JP版
  const jpLines = [
    `📊 ${year}年${seasonLabel(season, "jp")}アニメ 人気TOP5`,
    "",
    ...ranking.map((a, i) => {
      const title = a.title.native ?? a.title.romaji ?? "不明";
      const score = a.averageScore ? ` ★${a.averageScore}` : "";
      return `${medals[i]} ${title}${score}`;
    }),
    "",
    `全ランキングはこちら👇\n${SITE_URL}/ranking`,
    "",
    HASHTAGS.jp,
  ];

  // EN版
  const enLines = [
    `📊 ${seasonLabel(season, "en")} ${year} Anime Popularity TOP 5`,
    "",
    ...ranking.map((a, i) => {
      const title = a.title.english ?? a.title.romaji ?? a.title.native ?? "Unknown";
      const score = a.averageScore ? ` ★${a.averageScore}` : "";
      return `${medals[i]} ${title}${score}`;
    }),
    "",
    `Full rankings 👇\n${SITE_URL}/ranking`,
    "",
    HASHTAGS.en,
  ];

  box("🗓️  金曜投稿 — JP版", jpLines.join("\n"));
  box("🗓️  Friday Post — EN version", enLines.join("\n"));
}

// ========== エントリーポイント ==========

const type = process.argv.find((_, i, a) => a[i - 1] === "--type") ?? "";

if (!["monday", "wednesday", "friday"].includes(type)) {
  console.error("使い方: npx tsx --env-file=.env.local scripts/generate-tweet.ts --type [monday|wednesday|friday]");
  process.exit(1);
}

console.log(`\n✅ AniTabi X投稿文ジェネレーター — ${type.toUpperCase()}\n`);

(async () => {
  try {
    if (type === "monday")    await generateMonday();
    if (type === "wednesday") await generateWednesday();
    if (type === "friday")    await generateFriday();
  } catch (e) {
    console.error("エラー:", e);
    process.exit(1);
  }
})();

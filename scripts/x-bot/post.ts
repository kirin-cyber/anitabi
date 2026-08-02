#!/usr/bin/env node

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { config } from "./config.js";
import { generateContent } from "./content.js";
import {
  findPlannedSlot,
  getDailyPlan,
  getJstDateTime,
  type PlannedSlot,
  type PostLanguage,
  type PostType,
} from "./slots.js";
import { postTweet, uploadMedia } from "./x-api.js";

const LOG_DIRECTORY = `${process.cwd()}/scripts/x-bot/log`;
const POSTS_LOG_PATH = `${LOG_DIRECTORY}/posts.jsonl`;

interface CommandOptions {
  dryRun: boolean;
  type?: PostType;
  lang?: PostLanguage;
}

function parseCommandOptions(args: string[]): CommandOptions {
  const options: CommandOptions = {
    dryRun: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--type") {
      const value = args[index + 1]?.toUpperCase();
      if (value !== "A" && value !== "B") {
        throw new Error("--type には A または B を指定してください");
      }
      options.type = value;
      index += 1;
      continue;
    }
    if (arg === "--lang") {
      const value = args[index + 1]?.toLowerCase();
      if (value !== "jp" && value !== "en") {
        throw new Error("--lang には jp または en を指定してください");
      }
      options.lang = value;
      index += 1;
      continue;
    }

    throw new Error(`不明な引数です: ${arg}`);
  }

  return options;
}

function resolvePlan(options: CommandOptions, now: Date): {
  date: string;
  plan: PlannedSlot | null;
} {
  const { date } = getJstDateTime(now);

  if (options.type || options.lang) {
    const lang = options.lang ?? "jp";
    const dailyPlan = getDailyPlan(date).find((item) => item.lang === lang);
    if (!dailyPlan) {
      return { date, plan: null };
    }

    return {
      date,
      plan: {
        ...dailyPlan,
        type: options.type ?? dailyPlan.type,
        lang,
      },
    };
  }

  return {
    date,
    plan: findPlannedSlot(now),
  };
}

// 本番cron実行時の重複投稿防止: 同じ日付・スロット・言語が既に投稿済みか判定する
function alreadyPosted(date: string, slot: string, lang: PostLanguage): boolean {
  if (!existsSync(POSTS_LOG_PATH)) {
    return false;
  }
  const lines = readFileSync(POSTS_LOG_PATH, "utf8").split("\n").filter((line) => line.length > 0);
  return lines.some((line) => {
    try {
      const record = JSON.parse(line) as { date?: string; slot?: string; lang?: string };
      return record.date === date && record.slot === slot && record.lang === lang;
    } catch {
      return false;
    }
  });
}

async function downloadImage(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`画像サーバーが ${response.status} を返しました`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error: unknown) {
    throw new Error(`投稿画像のダウンロードに失敗しました: ${String(error)}`);
  }
}

function printDryRun(
  date: string,
  plan: PlannedSlot,
  text: string,
  imageUrl: string,
): void {
  console.log("=== AniTabi X Bot DRY_RUN ===");
  console.log(`date: ${date}`);
  console.log(`slot: ${plan.slot}`);
  console.log(`type: ${plan.type}`);
  console.log(`lang: ${plan.lang}`);
  console.log("--- 投稿文 ---");
  console.log(text);
  console.log("--- 画像URL ---");
  console.log(imageUrl);
}

async function main(): Promise<void> {
  try {
    const options = parseCommandOptions(process.argv.slice(2));
    const { date, plan } = resolvePlan(options, new Date());

    // 通常実行では、当日の選定枠でない限り何も出力せず終了する。
    if (!plan) {
      return;
    }

    // 本番cron実行（引数なし）で同一スロットを既に投稿済みならスキップ（重複投稿・二重課金の防止）。
    // 手動テスト（--type/--lang）は冪等チェックを行わず再実行できる。
    if (!options.dryRun && !options.type && !options.lang && alreadyPosted(date, plan.slot, plan.lang)) {
      return;
    }

    const content = await generateContent(plan.type, date, plan.lang);
    const dryRun = options.dryRun || config.dryRun;

    if (dryRun) {
      printDryRun(date, plan, content.text, content.imageUrl);
      return;
    }

    const imageBuffer = await downloadImage(content.imageUrl);
    const mediaId = await uploadMedia(imageBuffer);
    const tweet = await postTweet(content.text, [mediaId]);
    const textPreview = Array.from(content.text).slice(0, 50).join("");

    mkdirSync(LOG_DIRECTORY, { recursive: true });
    appendFileSync(
      POSTS_LOG_PATH,
      `${JSON.stringify({
        date,
        slot: plan.slot,
        type: plan.type,
        lang: plan.lang,
        tweetId: tweet.id,
        textPreview,
      })}\n`,
      "utf8",
    );
  } catch (error: unknown) {
    console.error(`AniTabi X Botエラー: ${String(error)}`);
    process.exitCode = 1;
  }
}

void main();

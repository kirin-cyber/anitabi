#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { getJstDateTime, type PostLanguage, type PostType } from "./slots.js";
import { getTweetsMetrics, type TweetMetrics } from "./x-api.js";

const LOG_DIRECTORY = `${process.cwd()}/scripts/x-bot/log`;
const POSTS_LOG_PATH = `${LOG_DIRECTORY}/posts.jsonl`;
const METRICS_CHUNK_SIZE = 100;

interface PostRecord {
  date: string;
  slot: string;
  type: PostType;
  lang: PostLanguage;
  tweetId: string;
  textPreview: string;
}

interface RecordWithMetrics extends PostRecord {
  metrics: TweetMetrics | null;
}

interface AggregateStat {
  type: PostType;
  lang: PostLanguage;
  bucket: string;
  count: number;
  totalImpressions: number;
  totalLikes: number;
  totalRetweets: number;
}

interface CommandOptions {
  dryRun: boolean;
}

function parseCommandOptions(args: string[]): CommandOptions {
  const options: CommandOptions = { dryRun: false };

  for (const arg of args) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    throw new Error(`不明な引数です: ${arg}`);
  }

  return options;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePostRecord(line: string): PostRecord | null {
  try {
    const parsed: unknown = JSON.parse(line);
    if (!isRecord(parsed)) {
      return null;
    }

    const { date, slot, type, lang, tweetId, textPreview } = parsed;

    if (
      typeof date !== "string"
      || typeof slot !== "string"
      || (type !== "A" && type !== "B")
      || (lang !== undefined && lang !== "jp" && lang !== "en")
      || typeof tweetId !== "string"
      || typeof textPreview !== "string"
    ) {
      return null;
    }

    // Phase1の記録には lang が無い（JP版のみ運用だったため）。後方互換として jp とみなす
    const resolvedLang = lang === "en" ? "en" : "jp";

    return { date, slot, type, lang: resolvedLang, tweetId, textPreview };
  } catch {
    return null;
  }
}

// 記録済みの投稿ログを読み込む。壊れた行・型が合わない行は静かにスキップする
function readPostRecords(path: string): PostRecord[] {
  try {
    if (!existsSync(path)) {
      return [];
    }

    const lines = readFileSync(path, "utf8").split("\n").filter((line) => line.length > 0);
    const records: PostRecord[] = [];

    for (const line of lines) {
      const record = parsePostRecord(line);
      if (record) {
        records.push(record);
      }
    }

    return records;
  } catch (error: unknown) {
    throw new Error(`posts.jsonlの読み込みに失敗しました: ${String(error)}`);
  }
}

// 時刻(JST)を4時間区切りの帯に丸める。探索期のサンプル数に合わせた暫定粒度
function getTimeBucket(slot: string): string {
  const pad = (value: number): string => value.toString().padStart(2, "0");
  const hour = Number(slot.split(":")[0]);
  const bucketStart = Math.floor(hour / 4) * 4;
  const bucketEnd = bucketStart + 4;

  return `${pad(bucketStart)}-${pad(bucketEnd)}`;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

// 複数tweetIdを最大100件ずつにまとめてAPI呼び出し回数を最小化する
async function fetchAllMetrics(tweetIds: string[]): Promise<Map<string, TweetMetrics>> {
  try {
    const chunks = chunkArray(tweetIds, METRICS_CHUNK_SIZE);
    const metricsMap = new Map<string, TweetMetrics>();

    for (const chunk of chunks) {
      const metrics = await getTweetsMetrics(chunk);
      for (const item of metrics) {
        metricsMap.set(item.id, item);
      }
    }

    return metricsMap;
  } catch (error: unknown) {
    throw new Error(`ツイート指標の一括取得に失敗しました: ${String(error)}`);
  }
}

function buildGroupKey(type: PostType, lang: PostLanguage, bucket: string): string {
  return `${type}|${lang}|${bucket}`;
}

function aggregate(records: RecordWithMetrics[]): AggregateStat[] {
  const map = new Map<string, AggregateStat>();

  for (const record of records) {
    if (!record.metrics) {
      continue;
    }

    const bucket = getTimeBucket(record.slot);
    const key = buildGroupKey(record.type, record.lang, bucket);
    const existing = map.get(key);

    if (existing) {
      existing.count += 1;
      existing.totalImpressions += record.metrics.publicMetrics.impressionCount;
      existing.totalLikes += record.metrics.publicMetrics.likeCount;
      existing.totalRetweets += record.metrics.publicMetrics.retweetCount;
      continue;
    }

    map.set(key, {
      type: record.type,
      lang: record.lang,
      bucket,
      count: 1,
      totalImpressions: record.metrics.publicMetrics.impressionCount,
      totalLikes: record.metrics.publicMetrics.likeCount,
      totalRetweets: record.metrics.publicMetrics.retweetCount,
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    const averageA = a.totalImpressions / a.count;
    const averageB = b.totalImpressions / b.count;
    return averageB - averageA;
  });
}

function formatAverage(total: number, count: number): string {
  return (total / count).toFixed(1);
}

function buildMarkdownReport(
  date: string,
  totalRecords: number,
  stats: AggregateStat[],
  missingCount: number,
): string {
  const lines: string[] = [
    `# AniTabi X Bot 週次統計（${date}）`,
    "",
    `対象投稿数: ${totalRecords}件（うち指標未取得: ${missingCount}件）`,
    "",
    "| 型 | 言語 | 時間帯(JST) | 件数 | 平均インプレッション | 平均いいね | 平均リポスト |",
    "|---|---|---|---|---|---|---|",
  ];

  for (const stat of stats) {
    lines.push(
      `| ${stat.type} | ${stat.lang} | ${stat.bucket} | ${stat.count} | ${
        formatAverage(stat.totalImpressions, stat.count)
      } | ${formatAverage(stat.totalLikes, stat.count)} | ${formatAverage(stat.totalRetweets, stat.count)} |`,
    );
  }

  if (stats.length === 0) {
    lines.push("| - | - | - | - | - | - | - |");
  }

  return `${lines.join("\n")}\n`;
}

function printSummary(stats: AggregateStat[]): void {
  console.log("=== AniTabi X Bot 週次統計 要約 ===");

  if (stats.length === 0) {
    console.log("集計対象データがありません");
    return;
  }

  for (const stat of stats) {
    console.log(
      `${stat.type} / ${stat.lang} / ${stat.bucket}: 件数${stat.count} `
      + `平均imp=${formatAverage(stat.totalImpressions, stat.count)} `
      + `平均like=${formatAverage(stat.totalLikes, stat.count)} `
      + `平均RT=${formatAverage(stat.totalRetweets, stat.count)}`,
    );
  }
}

function printDryRun(records: PostRecord[]): void {
  console.log("=== AniTabi X Bot 週次統計 DRY_RUN ===");
  console.log(`posts.jsonl 記録件数: ${records.length}`);

  if (records.length === 0) {
    console.log("集計対象がありません（API呼び出しは行いません）");
    return;
  }

  const groupCounts = new Map<string, number>();

  for (const record of records) {
    const bucket = getTimeBucket(record.slot);
    const key = buildGroupKey(record.type, record.lang, bucket);
    groupCounts.set(key, (groupCounts.get(key) ?? 0) + 1);
  }

  console.log("--- 集計対象（型×言語×時間帯） ---");
  for (const [key, count] of groupCounts) {
    console.log(`${key}: ${count}件`);
  }

  const chunkCount = chunkArray(records, METRICS_CHUNK_SIZE).length;
  console.log(`本番実行時のAPIリクエスト予定回数: ${chunkCount}回（最大100件/回でまとめて取得）`);
  console.log("（API呼び出しは実行していません）");
}

async function main(): Promise<void> {
  try {
    const options = parseCommandOptions(process.argv.slice(2));
    const records = readPostRecords(POSTS_LOG_PATH);

    if (options.dryRun) {
      printDryRun(records);
      return;
    }

    if (records.length === 0) {
      console.log("posts.jsonlに記録がありません。集計を行いませんでした");
      return;
    }

    const tweetIds = records.map((record) => record.tweetId);
    const metricsMap = await fetchAllMetrics(tweetIds);
    const recordsWithMetrics: RecordWithMetrics[] = records.map((record) => ({
      ...record,
      metrics: metricsMap.get(record.tweetId) ?? null,
    }));
    const missingCount = recordsWithMetrics.filter((record) => !record.metrics).length;
    const stats = aggregate(recordsWithMetrics);
    const { date } = getJstDateTime(new Date());
    const reportPath = `${LOG_DIRECTORY}/stats_${date}.md`;
    const report = buildMarkdownReport(date, records.length, stats, missingCount);

    mkdirSync(LOG_DIRECTORY, { recursive: true });
    writeFileSync(reportPath, report, "utf8");

    printSummary(stats);
    console.log("");
    console.log(`レポートを保存しました: ${reportPath}`);

    if (missingCount > 0) {
      console.log(`指標が取得できなかった投稿: ${missingCount}件（削除済みツイート等の可能性）`);
    }
  } catch (error: unknown) {
    console.error(`AniTabi X Bot週次統計エラー: ${String(error)}`);
    process.exitCode = 1;
  }
}

void main();

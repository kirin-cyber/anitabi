import { readFileSync } from "node:fs";

const ENV_PATH = `${process.cwd()}/.env.local`;

function normalizeEnvValue(rawValue: string): string {
  const value = rawValue.trim();
  const quote = value.at(0);

  if (
    value.length >= 2
    && (quote === "\"" || quote === "'")
    && value.at(-1) === quote
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvLocal(): void {
  try {
    const content = readFileSync(ENV_PATH, "utf8");

    for (const line of content.split(/\r?\n/u)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/u);
      if (!match || process.env[match[1]] !== undefined) {
        continue;
      }

      process.env[match[1]] = normalizeEnvValue(match[2]);
    }
  } catch (error: unknown) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    if (errorCode !== "ENOENT") {
      throw new Error(`.env.local の読み込みに失敗しました: ${String(error)}`);
    }
  }
}

loadEnvLocal();

const x = {
  consumerKey: process.env.X_CONSUMER_KEY ?? "",
  consumerSecret: process.env.X_CONSUMER_SECRET ?? "",
  accessToken: process.env.X_ACCESS_TOKEN ?? "",
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET ?? "",
  bearerToken: process.env.X_BEARER_TOKEN ?? "",
};

const hasAllCredentials = Object.values(x).every((value) => value.length > 0);

export const config = {
  x,
  dryRun: !hasAllCredentials,
} as const;

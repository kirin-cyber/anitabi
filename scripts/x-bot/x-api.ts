import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "./config.js";

const X_API_BASE = "https://api.x.com/2";
// v1.1のmedia/uploadは2025-06-09に廃止済み。v2エンドポイントを使う
const X_UPLOAD_URL = "https://api.x.com/2/media/upload";

export interface PostedTweet {
  id: string;
  text: string;
}

export interface TweetMetrics {
  id: string;
  text: string;
  publicMetrics: {
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    bookmarkCount: number;
    impressionCount: number;
  };
}

interface TweetResponse {
  data: {
    id: string;
    text: string;
  };
}

// v2の画像アップロードは { data: { id, media_key, ... } } を返す
interface UploadResponse {
  data?: {
    id?: string;
  };
}

interface MetricsResponse {
  data?: Array<{
    id: string;
    text: string;
    public_metrics: {
      retweet_count: number;
      reply_count: number;
      like_count: number;
      quote_count: number;
      bookmark_count?: number;
      impression_count?: number;
    };
  }>;
}

function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/gu,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join("&");
  const signingKey = [
    percentEncode(config.x.consumerSecret),
    percentEncode(config.x.accessTokenSecret),
  ].join("&");

  return crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");
}

function createOAuthHeader(method: string, url: string): string {
  if (
    !config.x.consumerKey
    || !config.x.consumerSecret
    || !config.x.accessToken
    || !config.x.accessTokenSecret
  ) {
    throw new Error("X APIのOAuth認証情報が不足しています");
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.x.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: config.x.accessToken,
    oauth_version: "1.0",
  };

  oauthParams.oauth_signature = generateOAuthSignature(method, url, oauthParams);

  return `OAuth ${Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(", ")}`;
}

async function readJson<T>(response: Response, context: string): Promise<T> {
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`${context}に失敗しました（${response.status}）: ${responseText}`);
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (error: unknown) {
    throw new Error(`${context}のレスポンスを解析できませんでした: ${String(error)}`);
  }
}

export async function postTweet(
  text: string,
  mediaIds: string[] = [],
): Promise<PostedTweet> {
  try {
    const body: {
      text: string;
      media?: { media_ids: string[] };
    } = { text };

    if (mediaIds.length > 0) {
      body.media = { media_ids: mediaIds };
    }

    const url = `${X_API_BASE}/tweets`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: createOAuthHeader("POST", url),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await readJson<TweetResponse>(response, "ツイート投稿");

    return result.data;
  } catch (error: unknown) {
    throw new Error(`ツイート投稿処理でエラーが発生しました: ${String(error)}`);
  }
}

export async function uploadMedia(imagePathOrBuffer: string | Buffer): Promise<string> {
  try {
    const imageBuffer = typeof imagePathOrBuffer === "string"
      ? readFileSync(imagePathOrBuffer)
      : imagePathOrBuffer;
    const fileName = typeof imagePathOrBuffer === "string"
      ? imagePathOrBuffer.split("/").at(-1) ?? "image"
      : "image";
    const formData = new FormData();

    formData.append(
      "media",
      new Blob([new Uint8Array(imageBuffer)]),
      fileName,
    );
    formData.append("media_category", "tweet_image");

    const response = await fetch(X_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: createOAuthHeader("POST", X_UPLOAD_URL),
      },
      body: formData,
    });
    const result = await readJson<UploadResponse>(response, "画像アップロード");

    const mediaId = result.data?.id;

    if (!mediaId) {
      throw new Error("media idがレスポンスにありません");
    }

    return mediaId;
  } catch (error: unknown) {
    throw new Error(`画像アップロード処理でエラーが発生しました: ${String(error)}`);
  }
}

export async function getTweetsMetrics(ids: string[]): Promise<TweetMetrics[]> {
  try {
    if (ids.length === 0) {
      return [];
    }
    if (ids.length > 100) {
      throw new Error("1回に取得できるツイートは最大100件です");
    }
    if (!config.x.bearerToken) {
      throw new Error("X_BEARER_TOKEN が設定されていません");
    }

    const url = new URL(`${X_API_BASE}/tweets`);
    url.searchParams.set("ids", ids.join(","));
    url.searchParams.set("tweet.fields", "public_metrics");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.x.bearerToken}`,
      },
    });
    const result = await readJson<MetricsResponse>(response, "ツイート指標取得");

    return (result.data ?? []).map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      publicMetrics: {
        retweetCount: tweet.public_metrics.retweet_count,
        replyCount: tweet.public_metrics.reply_count,
        likeCount: tweet.public_metrics.like_count,
        quoteCount: tweet.public_metrics.quote_count,
        bookmarkCount: tweet.public_metrics.bookmark_count ?? 0,
        impressionCount: tweet.public_metrics.impression_count ?? 0,
      },
    }));
  } catch (error: unknown) {
    throw new Error(`ツイート指標取得処理でエラーが発生しました: ${String(error)}`);
  }
}

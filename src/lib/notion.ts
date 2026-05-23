import { calcRank } from "@/constants/voice-actors";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DB_ID = process.env.NOTION_VOICE_ACTORS_DB_ID!;

const HEADERS = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

export interface NotionVoiceActor {
  id: string;
  name: string;
  nameEn: string;
  reading: string;
  debutYear: number;
  agency: string;
  isCurrentSeason: boolean;
  description: string;
  notableRoles: string;
  xUrl: string | null;
  officialUrl: string | null;
  rank: ReturnType<typeof calcRank>;
}

function extractText(prop: Record<string, unknown> | undefined): string {
  if (!prop) return "";
  const arr = prop.rich_text as Array<{ plain_text: string }> | undefined;
  return arr?.map((t) => t.plain_text).join("") ?? "";
}

function extractTitle(prop: Record<string, unknown> | undefined): string {
  if (!prop) return "";
  const arr = prop.title as Array<{ plain_text: string }> | undefined;
  return arr?.map((t) => t.plain_text).join("") ?? "";
}

function toVoiceActor(page: Record<string, unknown>): NotionVoiceActor {
  const props = page.properties as Record<string, Record<string, unknown>>;
  const debutYear = (props["デビュー年"]?.number as number | null) ?? 0;

  return {
    id: page.id as string,
    name: extractTitle(props["名前"]),
    nameEn: extractText(props["英語名"]),
    reading: extractText(props["読み"]),
    debutYear,
    agency: extractText(props["事務所"]),
    isCurrentSeason: (props["今季出演"]?.checkbox as boolean) ?? false,
    description: extractText(props["説明"]),
    notableRoles: extractText(props["代表作"]),
    xUrl: (props["X"]?.url as string | null) ?? null,
    officialUrl: (props["公式サイト"]?.url as string | null) ?? null,
    rank: calcRank(debutYear),
  };
}

export async function getVoiceActors(): Promise<NotionVoiceActor[]> {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DB_ID}/query`,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        sorts: [{ property: "デビュー年", direction: "ascending" }],
      }),
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  const data = await res.json();
  return (data.results as Record<string, unknown>[]).map(toVoiceActor);
}

export async function getVoiceActorByName(
  name: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DB_ID}/query`,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        filter: { property: "名前", title: { contains: name } },
        page_size: 1,
      }),
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.results?.[0]?.id as string | undefined) ?? null;
}

export async function getVoiceActorById(
  id: string
): Promise<NotionVoiceActor | null> {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: HEADERS,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const page = await res.json();
  return toVoiceActor(page);
}

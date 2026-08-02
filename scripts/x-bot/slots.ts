const JST_TIME_ZONE = "Asia/Tokyo";
const MINUTES_PER_DAY = 24 * 60;
const MINIMUM_SEPARATION_MINUTES = 2 * 60;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type SlotTime = string;
export type PostType = "A" | "B";
export type PostLanguage = "jp" | "en";

export interface PlannedSlot {
  slot: SlotTime;
  type: PostType;
  lang: PostLanguage;
}

export interface JstDateTime {
  date: string;
  minutes: number;
}

function hashText(text: string): number {
  let hash = 2166136261;

  for (const character of text) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getDailyPlan(date: string): [PlannedSlot, PlannedSlot] {
  try {
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (!Number.isFinite(timestamp)) {
      throw new Error(`日付形式が不正です: ${date}`);
    }

    const dayNumber = Math.floor(timestamp / MILLISECONDS_PER_DAY);
    const type: PostType = dayNumber % 2 === 0 ? "A" : "B";
    const jpMinutes = hashText(`${date}:jp`) % MINUTES_PER_DAY;
    const offsetRange = MINUTES_PER_DAY - (2 * MINIMUM_SEPARATION_MINUTES) + 1;
    const offset = MINIMUM_SEPARATION_MINUTES
      + (hashText(`${date}:en`) % offsetRange);
    const enMinutes = (jpMinutes + offset) % MINUTES_PER_DAY;

    return [
      { slot: minutesToSlot(jpMinutes), type, lang: "jp" },
      { slot: minutesToSlot(enMinutes), type, lang: "en" },
    ];
  } catch (error: unknown) {
    throw new Error(`日次投稿計画の生成に失敗しました: ${String(error)}`);
  }
}

export function getJstDateTime(now: Date = new Date()): JstDateTime {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const valueOf = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  const year = valueOf("year");
  const month = valueOf("month");
  const day = valueOf("day");
  const hour = Number(valueOf("hour"));
  const minute = Number(valueOf("minute"));

  return {
    date: `${year}-${month}-${day}`,
    minutes: (hour * 60) + minute,
  };
}

function slotToMinutes(slot: SlotTime): number {
  const [hour, minute] = slot.split(":").map(Number);
  return (hour * 60) + minute;
}

function minutesToSlot(minutes: number): SlotTime {
  const hour = Math.floor(minutes / 60).toString().padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

export function findPlannedSlot(
  now: Date = new Date(),
  toleranceMinutes = 10,
): PlannedSlot | null {
  const current = getJstDateTime(now);
  return getDailyPlan(current.date).find(
    (plan) => Math.abs(slotToMinutes(plan.slot) - current.minutes) <= toleranceMinutes,
  ) ?? null;
}

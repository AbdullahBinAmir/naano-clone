import { daysBetween } from "@/lib/brand/deal-progress";

export type SeriesRange = "days" | "weeks" | "months";

export interface PostPoint {
  /** ISO timestamp the post went live. */
  date: string;
  reach: number;
}

export interface SnapshotPoint {
  creatorId: string;
  /** ISO timestamp the snapshot was captured. */
  date: string;
  reach: number;
}

export interface SeriesPoint {
  label: string;
  current: number;
  previous: number;
}

const DAY_MS = 86_400_000;
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function daySeries(posts: PostPoint[], today: string): SeriesPoint[] {
  const n = 14;
  const byDay = new Map<string, number>();
  for (const p of posts) byDay.set(p.date.slice(0, 10), (byDay.get(p.date.slice(0, 10)) ?? 0) + p.reach);
  const end = Date.parse(today);
  return Array.from({ length: n }, (_, i) => {
    const ms = end - (n - 1 - i) * DAY_MS;
    return {
      label: new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      current: byDay.get(isoDay(ms)) ?? 0,
      previous: byDay.get(isoDay(ms - n * DAY_MS)) ?? 0,
    };
  });
}

function weekSeries(posts: PostPoint[], today: string): SeriesPoint[] {
  const n = 8;
  const bucket = (date: string) => Math.floor(daysBetween(date, today) / 7); // 0 = most recent 7 days
  const sums = new Map<number, number>();
  for (const p of posts) {
    const b = bucket(p.date);
    if (b >= 0) sums.set(b, (sums.get(b) ?? 0) + p.reach);
  }
  const end = Date.parse(today);
  return Array.from({ length: n }, (_, i) => {
    const b = n - 1 - i;
    return {
      label: new Date(end - b * 7 * DAY_MS).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      current: sums.get(b) ?? 0,
      previous: sums.get(b + n) ?? 0,
    };
  });
}

function monthSeries(snapshots: SnapshotPoint[], today: string): SeriesPoint[] {
  const n = 6;
  const [ty, tm] = today.split("-").map(Number);
  const monthIndex = (iso: string) => {
    const [y, m] = iso.split("-").map(Number);
    return (ty - y) * 12 + (tm - m); // 0 = current month
  };
  // Latest snapshot per creator per month, then summed across creators.
  const latest = new Map<string, SnapshotPoint>();
  for (const s of snapshots) {
    const key = `${s.creatorId}|${monthIndex(s.date)}`;
    const cur = latest.get(key);
    if (!cur || s.date > cur.date) latest.set(key, s);
  }
  const sums = new Map<number, number>();
  for (const s of latest.values()) {
    const idx = monthIndex(s.date);
    if (idx >= 0) sums.set(idx, (sums.get(idx) ?? 0) + s.reach);
  }
  return Array.from({ length: n }, (_, i) => {
    const b = n - 1 - i;
    return {
      label: new Date(Date.UTC(ty, tm - 1 - b, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      current: sums.get(b) ?? 0,
      previous: sums.get(b + n) ?? 0,
    };
  });
}

/** Days/weeks come from individual posts; months from the monthly stat snapshots. */
export function buildSeries(range: SeriesRange, posts: PostPoint[], snapshots: SnapshotPoint[], today: string): SeriesPoint[] {
  if (range === "days") return daySeries(posts, today);
  if (range === "weeks") return weekSeries(posts, today);
  return monthSeries(snapshots, today);
}

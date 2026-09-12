"use server";

import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { analyticsSnapshotSchema, csvPostRowSchema } from "@/lib/validations/analytics";

export interface AnalyticsActionResult {
  error?: string;
  insertedCount?: number;
  skippedCount?: number;
}

/**
 * Updates the creator's real follower count and records a new analytics
 * snapshot in one call. Two writes, not a transaction — acceptable here
 * since both are owner-scoped, idempotent-ish updates with no cross-table
 * invariant to protect (unlike, say, a payout).
 */
export async function saveAnalyticsSnapshotAction(input: unknown): Promise<AnalyticsActionResult> {
  const parsed = analyticsSnapshotSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error: profileError } = await supabase
    .from("creator_profiles")
    .update({ follower_count: parsed.data.followerCount })
    .eq("profile_id", user.id);
  if (profileError) return { error: profileError.message };

  const { error: snapshotError } = await supabase.from("linkedin_analytics_snapshots").insert({
    creator_profile_id: user.id,
    follower_count: parsed.data.followerCount,
    public_post_reach: parsed.data.publicPostReach,
    public_posts_count: parsed.data.publicPostsCount,
    public_engagements: parsed.data.publicEngagements,
    pct_posts_with_reach_data: parsed.data.pctPostsWithReachData,
    source: "manual_entry",
    raw_payload: {},
  });
  if (snapshotError) return { error: snapshotError.message };

  return {};
}

/**
 * Expects a CSV with headers: post_url, posted_at, reach, engagements
 * (reach/engagements optional per row). No LinkedIn export format is
 * verified/supported here — see the project plan's decision to never scrape
 * or assume undocumented third-party formats; this is our own simple shape,
 * documented in the upload UI.
 */
export async function uploadPostsCsvAction(formData: FormData): Promise<AnalyticsActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (file.size > 1_000_000) return { error: "File is too large (max 1MB)." };

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return { error: "Couldn't read that file as CSV." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  let skippedCount = 0;
  const rows: {
    creator_profile_id: string;
    original_post_url: string;
    posted_at: string;
    reach: number | null;
    engagements: number;
    has_reach_data: boolean;
  }[] = [];

  for (const raw of parsed.data) {
    const rowParsed = csvPostRowSchema.safeParse(raw);
    if (!rowParsed.success) {
      skippedCount += 1;
      continue;
    }
    const postedAt = new Date(rowParsed.data.posted_at);
    if (Number.isNaN(postedAt.getTime())) {
      skippedCount += 1;
      continue;
    }
    const reachNum = rowParsed.data.reach !== undefined && rowParsed.data.reach !== "" ? Number(rowParsed.data.reach) : null;
    const engagementsNum = rowParsed.data.engagements !== undefined && rowParsed.data.engagements !== "" ? Number(rowParsed.data.engagements) : 0;

    rows.push({
      creator_profile_id: user.id,
      original_post_url: rowParsed.data.post_url,
      posted_at: postedAt.toISOString(),
      reach: reachNum !== null && !Number.isNaN(reachNum) ? reachNum : null,
      engagements: Number.isNaN(engagementsNum) ? 0 : engagementsNum,
      has_reach_data: reachNum !== null && !Number.isNaN(reachNum),
    });
  }

  if (rows.length === 0) {
    return { error: "No valid rows found. Expected columns: post_url, posted_at, reach, engagements." };
  }

  const { error } = await supabase.from("linkedin_posts").insert(rows);
  if (error) return { error: error.message };

  return { insertedCount: rows.length, skippedCount };
}

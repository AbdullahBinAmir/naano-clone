import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/creator/analytics-dashboard";
import type { LinkedinAnalyticsSnapshotRow, LinkedinPostRow } from "@/types/database";

export default async function AnalyticsPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();

  const [{ data: profileRow }, { data: snapshots }, { data: posts }] = await Promise.all([
    supabase.from("creator_profiles").select("follower_count").eq("profile_id", user.id).maybeSingle(),
    supabase
      .from("linkedin_analytics_snapshots")
      .select("*")
      .eq("creator_profile_id", user.id)
      .order("captured_at", { ascending: false })
      .limit(12),
    supabase
      .from("linkedin_posts")
      .select("*")
      .eq("creator_profile_id", user.id)
      .order("posted_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <AnalyticsDashboard
      followerCount={profileRow?.follower_count ?? 0}
      snapshots={(snapshots ?? []) as LinkedinAnalyticsSnapshotRow[]}
      posts={(posts ?? []) as LinkedinPostRow[]}
    />
  );
}

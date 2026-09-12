import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCreatorCard, rowToCreatorProfile } from "@/lib/mappers/creator";
import { OverviewDashboard } from "@/components/creator/overview-dashboard";

export default async function CreatorOverviewPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();

  const [{ data: profileRow }, { data: cardRow }, { data: snapshot }] = await Promise.all([
    supabase.from("creator_profiles").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("creator_cards").select("*").eq("creator_profile_id", user.id).maybeSingle(),
    supabase
      .from("linkedin_analytics_snapshots")
      .select("public_post_reach, public_posts_count, public_engagements")
      .eq("creator_profile_id", user.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profileRow || !cardRow) notFound();

  return (
    <OverviewDashboard
      profile={rowToCreatorProfile(profileRow)}
      card={rowToCreatorCard(cardRow)}
      snapshot={
        snapshot
          ? {
              publicPostReach: snapshot.public_post_reach,
              publicPostsCount: snapshot.public_posts_count,
              publicEngagements: snapshot.public_engagements,
            }
          : null
      }
    />
  );
}

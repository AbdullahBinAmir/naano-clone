import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCreatorCard, rowToCreatorProfile } from "@/lib/mappers/creator";
import { getEarningsSummaryForCreator } from "@/lib/earnings/get-earnings-summary";
import { getCreatorDeals } from "@/lib/creator/get-creator-deals";
import { getOpenBriefs } from "@/lib/creator/get-open-briefs";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";
import { CreatorOverview } from "@/components/creator/overview/creator-overview";

export default async function CreatorOverviewPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: profileRow }, { data: cardRow }, { data: snapshot }, deals, earnings] = await Promise.all([
    supabase.from("creator_profiles").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("creator_cards").select("*").eq("creator_profile_id", user.id).maybeSingle(),
    supabase
      .from("linkedin_analytics_snapshots")
      .select("public_post_reach, public_posts_count, public_engagements")
      .eq("creator_profile_id", user.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getCreatorDeals(supabase, user.id),
    getEarningsSummaryForCreator(supabase, user.id),
  ]);

  if (!profileRow || !cardRow) notFound();

  const unlocked = profileRow.follower_count >= MARKETPLACE_FOLLOWER_THRESHOLD;
  const allBriefs = unlocked ? await getOpenBriefs(supabase, user.id, today) : [];

  return (
    <CreatorOverview
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
      today={today}
      activeDeals={deals.active}
      offers={deals.offers}
      openBriefs={allBriefs.slice(0, 4)}
      openBriefCount={allBriefs.length}
      earnings={{
        totalEarned: earnings.totals.totalEarned,
        available: earnings.totals.available,
        inTransit: earnings.totals.inTransit,
      }}
    />
  );
}

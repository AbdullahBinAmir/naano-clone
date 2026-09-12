import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { OpportunitiesList } from "@/components/creator/opportunities-list";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getDemoOpportunitiesSync } from "@/lib/demo-data/opportunities";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";

export default async function OpportunitiesPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("creator_profiles")
    .select("follower_count")
    .eq("profile_id", user.id)
    .maybeSingle();

  const followerCount = profileRow?.follower_count ?? 0;
  const unlocked = followerCount >= MARKETPLACE_FOLLOWER_THRESHOLD;

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Opportunities"
        description="Open brand campaigns — apply, the brand accepts, and the booking is created on your terms."
      />

      {!unlocked ? (
        <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
          <Lock className="h-8 w-8 text-foreground-subtle" strokeWidth={1.5} />
          <p className="text-lg font-semibold">Paid campaigns open at {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers</p>
          <p className="max-w-md text-sm text-foreground-muted">
            You have {followerCount.toLocaleString()} followers. Update your count on Analytics as your audience
            grows.
          </p>
        </GlassCard>
      ) : (
        <OpportunitiesList opportunities={getDemoOpportunitiesSync()} />
      )}
    </>
  );
}

import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { BriefFeed, type FeedBrief } from "@/components/creator/brief-feed";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";
import { getOpenBriefs } from "@/lib/creator/get-open-briefs";

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
  const today = new Date().toISOString().slice(0, 10);
  const briefs: FeedBrief[] = unlocked ? await getOpenBriefs(supabase, user.id, today) : [];

  return (
    <>
      <PageHeader
        eyebrow="Brief feed"
        title="Open briefs"
        description="Paid campaigns from brands — see the budget and deadline first, then apply or ask a question."
      />

      {!unlocked ? (
        <Card padding="lg" className="flex flex-col items-center gap-3 py-16 text-center">
          <Lock className="h-8 w-8 text-foreground-subtle" strokeWidth={1.5} />
          <p className="text-lg font-medium">Paid campaigns open at {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers</p>
          <p className="max-w-md text-sm text-foreground-muted">
            You have {followerCount.toLocaleString()} followers. Update your count on Analytics as your audience grows.
          </p>
        </Card>
      ) : (
        <BriefFeed briefs={briefs} today={today} />
      )}
    </>
  );
}

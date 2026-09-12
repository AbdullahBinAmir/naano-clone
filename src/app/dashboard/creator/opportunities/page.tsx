import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { OpportunitiesList } from "@/components/creator/opportunities-list";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
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

  let opportunities: {
    id: string;
    title: string;
    briefText: string;
    budget: number;
    targetVertical: string;
    brandName: string;
    brandLogoUrl: string;
  }[] = [];

  if (unlocked) {
    const [{ data: campaigns }, { data: appliedRows }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("status", "published").order("created_at", { ascending: false }),
      supabase.from("collaborations").select("campaign_id").eq("creator_profile_id", user.id),
    ]);

    const appliedCampaignIds = new Set((appliedRows ?? []).map((r) => r.campaign_id).filter(Boolean));
    const openCampaigns = (campaigns ?? []).filter((c) => !appliedCampaignIds.has(c.id));

    const brandIds = [...new Set(openCampaigns.map((c) => c.brand_profile_id))];
    const { data: brands } =
      brandIds.length > 0
        ? await supabase.from("brand_profiles").select("profile_id, company_name, logo_url").in("profile_id", brandIds)
        : { data: [] };
    const brandById = new Map((brands ?? []).map((b) => [b.profile_id, b]));

    opportunities = openCampaigns.map((c) => ({
      id: c.id,
      title: c.title,
      briefText: c.brief_text,
      budget: c.budget,
      targetVertical: c.target_vertical,
      brandName: brandById.get(c.brand_profile_id)?.company_name ?? "Brand",
      brandLogoUrl: brandById.get(c.brand_profile_id)?.logo_url ?? "",
    }));
  }

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
        <OpportunitiesList opportunities={opportunities} />
      )}
    </>
  );
}

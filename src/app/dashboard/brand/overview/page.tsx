import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { BrandOverviewDashboard } from "@/components/brand/brand-overview-dashboard";

export default async function BrandOverviewPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const [{ data: brandRow }, { data: campaigns }, { count: creatorCount }] = await Promise.all([
    supabase.from("brand_profiles").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("campaigns").select("status, budget").eq("brand_profile_id", user.id),
    supabase.from("marketplace_creators").select("*", { count: "exact", head: true }),
  ]);

  if (!brandRow) notFound();

  return (
    <BrandOverviewDashboard
      companyName={brandRow.company_name}
      planTier={brandRow.plan_tier}
      activeCampaigns={(campaigns ?? []).filter((c) => c.status === "published").length}
      totalBudget={(campaigns ?? []).reduce((acc, c) => acc + c.budget, 0)}
      creatorsInNetwork={creatorCount ?? 0}
    />
  );
}

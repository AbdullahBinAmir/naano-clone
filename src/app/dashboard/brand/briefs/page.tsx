import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCampaign } from "@/lib/mappers/campaign";
import { BriefsWorkspace } from "@/components/brand/briefs-workspace";
import type { CampaignRow } from "@/types/database";

export default async function BriefsPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const [{ data }, { data: brand }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("brand_profile_id", user.id).order("created_at", { ascending: false }),
    supabase.from("brand_profiles").select("company_name").eq("profile_id", user.id).maybeSingle(),
  ]);

  const campaigns = ((data ?? []) as CampaignRow[]).map(rowToCampaign);

  return <BriefsWorkspace brandName={brand?.company_name ?? "Your brand"} campaigns={campaigns} today={new Date().toISOString().slice(0, 10)} />;
}

import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCampaign } from "@/lib/mappers/campaign";
import { CampaignsTable } from "@/components/brand/campaigns-table";
import type { CampaignRow } from "@/types/database";

export default async function CampaignsPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("brand_profile_id", user.id)
    .order("created_at", { ascending: false });

  const campaigns = ((data ?? []) as CampaignRow[]).map(rowToCampaign);

  return <CampaignsTable campaigns={campaigns} />;
}

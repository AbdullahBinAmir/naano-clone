import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCampaign } from "@/lib/mappers/campaign";
import { BriefsList } from "@/components/brand/briefs-list";
import type { CampaignRow } from "@/types/database";

export default async function BriefsPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("brand_profile_id", user.id)
    .order("created_at", { ascending: false });

  const campaigns = ((data ?? []) as CampaignRow[]).map(rowToCampaign);

  return <BriefsList campaigns={campaigns} />;
}

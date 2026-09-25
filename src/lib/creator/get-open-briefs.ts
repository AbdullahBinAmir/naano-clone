import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface OpenBrief {
  id: string;
  title: string;
  briefText: string;
  budget: number;
  targetVertical: string;
  brandName: string;
  brandProfileId: string;
  deadline: string | null;
  createdAt: string;
}

/** Published campaigns the creator hasn't applied to yet and whose apply-by date (if any) hasn't passed. */
export async function getOpenBriefs(
  supabase: SupabaseClient<Database>,
  creatorId: string,
  today: string,
): Promise<OpenBrief[]> {
  const [{ data: campaigns }, { data: appliedRows }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("collaborations").select("campaign_id").eq("creator_profile_id", creatorId),
  ]);

  const applied = new Set((appliedRows ?? []).map((r) => r.campaign_id).filter(Boolean));
  const open = (campaigns ?? []).filter((c) => !applied.has(c.id) && (!c.deadline || c.deadline >= today));
  if (open.length === 0) return [];

  const brandIds = [...new Set(open.map((c) => c.brand_profile_id))];
  const { data: brands } = await supabase.from("brand_profiles").select("profile_id, company_name").in("profile_id", brandIds);
  const brandById = new Map((brands ?? []).map((b) => [b.profile_id, b.company_name]));

  return open.map((c) => ({
    id: c.id,
    title: c.title,
    briefText: c.brief_text,
    budget: Number(c.budget),
    targetVertical: c.target_vertical,
    brandName: brandById.get(c.brand_profile_id) ?? "Brand",
    brandProfileId: c.brand_profile_id,
    deadline: c.deadline ?? null,
    createdAt: c.created_at,
  }));
}

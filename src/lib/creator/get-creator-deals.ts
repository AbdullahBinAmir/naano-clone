import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface CreatorDeal {
  id: string;
  brandName: string;
  campaignTitle: string;
  /** What the creator receives for this deal. */
  netPayout: number;
  createdAt: string;
  dueDate: string | null;
}

/** The creator's live deals: `active` (post to publish) and `needs_action` (offers to answer). */
export async function getCreatorDeals(supabase: SupabaseClient<Database>, creatorId: string) {
  const { data } = await supabase
    .from("collaborations")
    .select("id, status, brand_name, campaign_title, net_payout_to_creator, created_at, due_date")
    .eq("creator_profile_id", creatorId)
    .in("status", ["active", "in_review", "needs_action"])
    .order("created_at", { ascending: false });

  const toDeal = (r: NonNullable<typeof data>[number]): CreatorDeal => ({
    id: r.id,
    brandName: r.brand_name || "Brand",
    campaignTitle: r.campaign_title,
    netPayout: Number(r.net_payout_to_creator),
    createdAt: r.created_at,
    dueDate: r.due_date,
  });
  const rows = data ?? [];
  return {
    active: rows.filter((r) => r.status === "active" || r.status === "in_review").map(toDeal),
    offers: rows.filter((r) => r.status === "needs_action").map(toDeal),
  };
}

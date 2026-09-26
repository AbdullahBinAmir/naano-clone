import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaborationStatus, Database } from "@/types/database";

export interface DealCreator {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface BoardDeal {
  id: string;
  status: CollaborationStatus;
  creator: DealCreator;
  campaignTitle: string;
  agreedPrice: number;
  dueDate: string | null;
  createdAt: string;
  nextActionText: string;
  /** LinkedIn post the creator submitted for review. */
  postUrl: string | null;
  /** Set once the brand has paid (older deals are null). */
  fundedAt: string | null;
}

/** Every collaboration of the signed-in brand, newest first, with the creator's display info. */
export async function getBrandDeals(supabase: SupabaseClient<Database>, brandId: string): Promise<BoardDeal[]> {
  const { data } = await supabase
    .from("collaborations")
    .select("id, status, creator_profile_id, campaign_title, agreed_price, due_date, created_at, next_action_text, post_url, funded_at")
    .eq("brand_profile_id", brandId)
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  const ids = [...new Set(rows.map((r) => r.creator_profile_id))];
  const { data: creators } =
    ids.length > 0
      ? await supabase.from("creator_profiles").select("profile_id, display_name, avatar_url").in("profile_id", ids)
      : { data: [] as { profile_id: string; display_name: string; avatar_url: string }[] };
  const byId = new Map((creators ?? []).map((c) => [c.profile_id, c]));

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    creator: {
      id: r.creator_profile_id,
      name: byId.get(r.creator_profile_id)?.display_name ?? "Creator",
      avatarUrl: byId.get(r.creator_profile_id)?.avatar_url || null,
    },
    campaignTitle: r.campaign_title,
    agreedPrice: Number(r.agreed_price),
    dueDate: r.due_date,
    createdAt: r.created_at,
    nextActionText: r.next_action_text,
    postUrl: r.post_url,
    fundedAt: r.funded_at,
  }));
}

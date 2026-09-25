import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface Pitch {
  id: string;
  appliedAt: string;
  campaignTitle: string;
  /** Price the applicant is working at for this campaign (the campaign budget). */
  applicationPrice: number;
  creator: {
    id: string;
    name: string;
    avatarUrl: string | null;
    headline: string;
    location: string;
    tags: string[];
    followers: number;
    /** The creator's published list price, or null when their card isn't public. */
    listPrice: number | null;
  };
}

/** Applications (status `applied`) to the brand's campaigns, each joined to what the brand may read about the applicant. */
export async function getPitches(supabase: SupabaseClient<Database>, brandId: string): Promise<Pitch[]> {
  const { data } = await supabase
    .from("collaborations")
    .select("id, creator_profile_id, campaign_title, agreed_price, created_at")
    .eq("brand_profile_id", brandId)
    .eq("status", "applied")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const ids = [...new Set(rows.map((r) => r.creator_profile_id))];
  const [{ data: profiles }, { data: cards }] = await Promise.all([
    supabase
      .from("creator_profiles")
      .select("profile_id, display_name, avatar_url, headline, location, category_tags, follower_count")
      .in("profile_id", ids),
    supabase.from("creator_cards").select("creator_profile_id, price_per_post").in("creator_profile_id", ids),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.profile_id, p]));
  const priceById = new Map((cards ?? []).map((c) => [c.creator_profile_id, Number(c.price_per_post)]));

  return rows.map((r) => {
    const p = profileById.get(r.creator_profile_id);
    return {
      id: r.id,
      appliedAt: r.created_at,
      campaignTitle: r.campaign_title,
      applicationPrice: Number(r.agreed_price),
      creator: {
        id: r.creator_profile_id,
        name: p?.display_name ?? "Creator",
        avatarUrl: p?.avatar_url || null,
        headline: p?.headline ?? "",
        location: p?.location ?? "",
        tags: p?.category_tags ?? [],
        followers: p?.follower_count ?? 0,
        listPrice: priceById.get(r.creator_profile_id) ?? null,
      },
    };
  });
}

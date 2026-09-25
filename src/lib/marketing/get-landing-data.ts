import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ShowcaseCreator {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  headline: string;
  tags: string[];
  followers: number;
  pricePerPost: number;
}

export interface LandingData {
  creators: ShowcaseCreator[];
  /** Every marketplace-visible creator, not just the ones shown. */
  creatorCount: number;
  /** Brands with a published campaign (the only brands the public can read). */
  brandNames: string[];
}

const SHOWCASE_LIMIT = 12;

/**
 * Public landing data, read with the anon key so it only sees what RLS lets an
 * anonymous visitor see: marketplace-visible creators with a published card,
 * and brands with a published campaign. Cookie-free on purpose so the result
 * can be cached and shared across visitors.
 */
async function fetchLandingData(): Promise<LandingData> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const [{ data: creators, count }, { data: brands }] = await Promise.all([
    supabase
      .from("marketplace_creators")
      .select("profile_id, handle, display_name, avatar_url, headline, category_tags, follower_count", { count: "exact" })
      .order("follower_count", { ascending: false })
      .limit(SHOWCASE_LIMIT),
    supabase.from("brand_profiles").select("company_name").limit(12),
  ]);

  const ids = (creators ?? []).map((c) => c.profile_id);
  const { data: cards } =
    ids.length > 0
      ? await supabase.from("creator_cards").select("creator_profile_id, price_per_post").in("creator_profile_id", ids)
      : { data: [] as { creator_profile_id: string; price_per_post: number }[] };
  const priceById = new Map((cards ?? []).map((c) => [c.creator_profile_id, Number(c.price_per_post)]));

  return {
    creators: (creators ?? []).map((c) => ({
      id: c.profile_id,
      handle: c.handle,
      name: c.display_name,
      avatarUrl: c.avatar_url || null,
      headline: c.headline,
      tags: c.category_tags,
      followers: c.follower_count,
      pricePerPost: priceById.get(c.profile_id) ?? 0,
    })),
    creatorCount: count ?? creators?.length ?? 0,
    brandNames: [...new Set((brands ?? []).map((b) => b.company_name).filter(Boolean))],
  };
}

export const getLandingData = unstable_cache(fetchLandingData, ["landing-data"], { revalidate: 300 });

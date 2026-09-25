import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { PostPoint, SnapshotPoint } from "@/lib/brand/impressions-series";

export interface OverviewCreator {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface OverviewDeal {
  id: string;
  creator: OverviewCreator;
  campaignTitle: string;
  agreedPrice: number;
  createdAt: string;
  /** "YYYY-MM-DD", or null: nothing in the app sets a due date yet. */
  dueDate: string | null;
  /** Seconds until end of the due day (UTC) at query time; null without a due date. */
  secondsToDue: number | null;
}

export interface BrandOverviewData {
  /** Server "today" as YYYY-MM-DD (UTC) so server and client agree on it. */
  today: string;
  pitches: OverviewDeal[];
  waiting: OverviewDeal[];
  active: OverviewDeal[];
  totalSpend: number;
  spendDeals: number;
  spendCreators: OverviewCreator[];
  posts: PostPoint[];
  snapshots: SnapshotPoint[];
}

const HISTORY_DAYS = 500;

/**
 * Everything the brand overview shows, straight from Supabase (RLS-scoped to
 * the signed-in brand). "Spend" is the agreed price of active + completed
 * deals: money the brand has committed to, not a payment ledger — there is no
 * brand-side payment record yet.
 */
export async function getBrandOverview(supabase: SupabaseClient<Database>, brandId: string): Promise<BrandOverviewData> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const { data: rows } = await supabase
    .from("collaborations")
    .select("id, status, creator_profile_id, campaign_title, agreed_price, created_at, due_date")
    .eq("brand_profile_id", brandId)
    .order("created_at", { ascending: false });
  const collabs = rows ?? [];

  const creatorIds = [...new Set(collabs.map((c) => c.creator_profile_id))];
  const bookedIds = [
    ...new Set(collabs.filter((c) => c.status === "active" || c.status === "completed").map((c) => c.creator_profile_id)),
  ];
  const since = new Date(now.getTime() - HISTORY_DAYS * 86_400_000).toISOString();

  const [creatorsRes, postsRes, snapshotsRes] = await Promise.all([
    creatorIds.length > 0
      ? supabase.from("creator_profiles").select("profile_id, display_name, avatar_url").in("profile_id", creatorIds)
      : Promise.resolve({ data: [] as { profile_id: string; display_name: string; avatar_url: string }[] }),
    bookedIds.length > 0
      ? supabase
          .from("linkedin_posts")
          .select("posted_at, reach")
          .in("creator_profile_id", bookedIds)
          .gte("posted_at", since)
      : Promise.resolve({ data: [] as { posted_at: string; reach: number | null }[] }),
    bookedIds.length > 0
      ? supabase
          .from("linkedin_analytics_snapshots")
          .select("creator_profile_id, captured_at, public_post_reach")
          .in("creator_profile_id", bookedIds)
          .gte("captured_at", since)
      : Promise.resolve({ data: [] as { creator_profile_id: string; captured_at: string; public_post_reach: number | null }[] }),
  ]);

  const creatorById = new Map<string, OverviewCreator>();
  for (const c of creatorsRes.data ?? []) {
    creatorById.set(c.profile_id, { id: c.profile_id, name: c.display_name, avatarUrl: c.avatar_url || null });
  }
  const creatorOf = (id: string): OverviewCreator => creatorById.get(id) ?? { id, name: "Creator", avatarUrl: null };

  const toDeal = (c: (typeof collabs)[number]): OverviewDeal => ({
    id: c.id,
    creator: creatorOf(c.creator_profile_id),
    campaignTitle: c.campaign_title,
    agreedPrice: Number(c.agreed_price),
    createdAt: c.created_at,
    dueDate: c.due_date,
    secondsToDue: c.due_date
      ? Math.max(0, Math.floor((Date.parse(`${c.due_date}T23:59:59Z`) - now.getTime()) / 1000))
      : null,
  });

  const spending = collabs.filter((c) => c.status === "active" || c.status === "completed");

  return {
    today,
    pitches: collabs.filter((c) => c.status === "applied").map(toDeal),
    waiting: collabs.filter((c) => c.status === "needs_action").map(toDeal),
    active: collabs.filter((c) => c.status === "active").map(toDeal),
    totalSpend: spending.reduce((acc, c) => acc + Number(c.agreed_price), 0),
    spendDeals: spending.length,
    spendCreators: [...new Set(spending.map((c) => c.creator_profile_id))].map(creatorOf),
    posts: (postsRes.data ?? []).map((p) => ({ date: p.posted_at, reach: p.reach ?? 0 })),
    snapshots: (snapshotsRes.data ?? []).map((s) => ({
      creatorId: s.creator_profile_id,
      date: s.captured_at,
      reach: s.public_post_reach ?? 0,
    })),
  };
}

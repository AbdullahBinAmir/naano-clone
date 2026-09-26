import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface CollabStats {
  /** Collaborations in `active` status. */
  active: number;
  /** Collaborations in `needs_action` status. */
  needsAction: number;
  /** Up to 3 counterparts across active collaborations (brands for a creator, creators for a brand). */
  activeAvatars: { name: string; src: string | null }[];
  /** Distinct counterparts across active collaborations (drives the "+N" chip). */
  activeCounterparts: number;
}

/**
 * Real header counts: the viewer's own collaborations in `active` and
 * `needs_action` (RLS already scopes rows to the caller; the extra eq keeps
 * the query index-friendly and explicit about which side the viewer is).
 */
export async function getCollabStats(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: "creator" | "brand",
): Promise<CollabStats> {
  const viewerColumn = role === "creator" ? "creator_profile_id" : "brand_profile_id";
  const { data } = await supabase
    .from("collaborations")
    .select("status, brand_name, brand_logo_url, creator_profile_id, brand_profile_id")
    .eq(viewerColumn, userId)
    .in("status", ["active", "needs_action", "pending_payment", "in_review"]);

  const rows = data ?? [];
  const activeRows = rows.filter((r) => r.status === "active");
  // A brand's next step on an accepted deal is paying for it, and so is reviewing a submitted post, so both count as needing action.
  const needsAction = rows.filter((r) => r.status === "needs_action" || (role === "brand" && (r.status === "pending_payment" || r.status === "in_review"))).length;

  const counterparts = new Map<string, { name: string; src: string | null }>();
  if (role === "creator") {
    for (const r of activeRows) {
      if (!counterparts.has(r.brand_profile_id)) {
        counterparts.set(r.brand_profile_id, { name: r.brand_name || "Brand", src: r.brand_logo_url || null });
      }
    }
  } else {
    const ids = [...new Set(activeRows.map((r) => r.creator_profile_id))];
    if (ids.length > 0) {
      const { data: creators } = await supabase
        .from("creator_profiles")
        .select("profile_id, display_name, avatar_url")
        .in("profile_id", ids);
      const byId = new Map((creators ?? []).map((c) => [c.profile_id, c]));
      for (const id of ids) {
        const c = byId.get(id);
        counterparts.set(id, { name: c?.display_name || "Creator", src: c?.avatar_url || null });
      }
    }
  }

  return {
    active: activeRows.length,
    needsAction,
    activeAvatars: [...counterparts.values()].slice(0, 3),
    activeCounterparts: counterparts.size,
  };
}

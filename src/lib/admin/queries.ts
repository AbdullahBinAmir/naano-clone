import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin reads use the service role (the RLS-scoped client can't see other
 * people's rows). Only call these from pages behind requireProfile("admin").
 */

export async function getPayoutQueue() {
  const admin = createAdminClient();
  const { data: requests } = await admin.from("payout_requests").select("*").order("requested_at", { ascending: false }).limit(200);
  const rows = requests ?? [];
  const ids = [...new Set(rows.map((r) => r.creator_profile_id))];
  const { data: creators } = ids.length ? await admin.from("creator_profiles").select("profile_id, display_name").in("profile_id", ids) : { data: [] };
  const names = new Map((creators ?? []).map((c) => [c.profile_id, c.display_name]));
  return rows.map((r) => ({ ...r, creatorName: names.get(r.creator_profile_id) ?? "Creator" }));
}

export async function getDisputes() {
  const admin = createAdminClient();
  const { data: disputes } = await admin.from("disputes").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = disputes ?? [];
  const collabIds = [...new Set(rows.map((d) => d.collaboration_id))];
  const { data: collabs } = collabIds.length
    ? await admin
        .from("collaborations")
        .select("id, campaign_title, brand_name, creator_profile_id, brand_profile_id, agreed_price, net_payout_to_creator, post_url, status")
        .in("id", collabIds)
    : { data: [] };
  const byId = new Map((collabs ?? []).map((c) => [c.id, c]));
  const creatorIds = [...new Set((collabs ?? []).map((c) => c.creator_profile_id))];
  const { data: creators } = creatorIds.length ? await admin.from("creator_profiles").select("profile_id, display_name").in("profile_id", creatorIds) : { data: [] };
  const names = new Map((creators ?? []).map((c) => [c.profile_id, c.display_name]));
  const { data: payments } = collabIds.length
    ? await admin.from("payments").select("collaboration_id, gross_amount, currency, status").in("collaboration_id", collabIds)
    : { data: [] };
  return rows.map((d) => {
    const c = byId.get(d.collaboration_id);
    return {
      ...d,
      collab: c ?? null,
      creatorName: c ? (names.get(c.creator_profile_id) ?? "Creator") : "Creator",
      payment: (payments ?? []).find((p) => p.collaboration_id === d.collaboration_id && (p.status === "paid" || p.status === "refunded")) ?? null,
    };
  });
}

export async function getPaymentsOverview() {
  const admin = createAdminClient();
  const { data: payments } = await admin.from("payments").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = payments ?? [];
  const collabIds = [...new Set(rows.map((p) => p.collaboration_id))];
  const { data: collabs } = collabIds.length
    ? await admin.from("collaborations").select("id, campaign_title, brand_name, status, creator_profile_id").in("id", collabIds)
    : { data: [] };
  const byId = new Map((collabs ?? []).map((c) => [c.id, c]));
  return rows.map((p) => ({ ...p, collab: byId.get(p.collaboration_id) ?? null }));
}

export async function getAdminCounts() {
  const admin = createAdminClient();
  const head = { count: "exact", head: true } as const;
  const [payouts, disputes, unpaid, review] = await Promise.all([
    admin.from("payout_requests").select("id", head).in("status", ["requested", "processing"]),
    admin.from("disputes").select("id", head).eq("status", "open"),
    admin.from("collaborations").select("id", head).eq("status", "pending_payment"),
    admin.from("collaborations").select("id", head).eq("status", "in_review"),
  ]);
  return {
    openPayouts: payouts.count ?? 0,
    openDisputes: disputes.count ?? 0,
    awaitingPayment: unpaid.count ?? 0,
    inReview: review.count ?? 0,
  };
}

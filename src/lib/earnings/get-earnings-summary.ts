import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EarningsLedgerRow, PayoutMethodRow } from "@/types/database";

export interface StatementLine {
  id: string;
  date: string;
  type: EarningsLedgerRow["type"];
  status: EarningsLedgerRow["status"];
  amount: number;
  /** What the money was for, e.g. the campaign title; falls back to the entry type. */
  description: string;
  /** Brand that paid, when the entry is tied to a collaboration. */
  counterparty: string | null;
}

export interface EarningsSummary {
  entries: EarningsLedgerRow[];
  statement: StatementLine[];
  payoutMethods: PayoutMethodRow[];
  monthly: { month: string; amount: number }[];
  totals: {
    totalEarned: number;
    inTransit: number;
    available: number;
    paidCollaborations: number;
  };
}

/**
 * Settles any of the creator's own in_transit rows old enough to have
 * "arrived" (see settle_pending_earnings in
 * supabase/migrations/0009_earnings_integrity.sql) and then assembles the
 * Earnings page's data. Best-effort settle: a failure there shouldn't block
 * reading the page.
 */
export async function getEarningsSummaryForCreator(
  supabase: SupabaseClient<Database>,
  creatorProfileId: string,
): Promise<EarningsSummary> {
  try {
    await supabase.rpc("settle_pending_earnings");
  } catch (e) {
    console.error("settle_pending_earnings failed (non-fatal):", e);
  }

  const [{ data: entries }, { data: payoutMethods }] = await Promise.all([
    supabase
      .from("earnings_ledger")
      .select("*")
      .eq("creator_profile_id", creatorProfileId)
      .order("created_at", { ascending: false }),
    supabase.from("payout_methods").select("*").eq("creator_profile_id", creatorProfileId),
  ]);

  const rows = entries ?? [];

  const collabIds = [...new Set(rows.map((r) => r.collaboration_id).filter((id): id is string => !!id))];
  const { data: collabs } =
    collabIds.length > 0
      ? await supabase.from("collaborations").select("id, campaign_title, brand_name").in("id", collabIds)
      : { data: [] as { id: string; campaign_title: string; brand_name: string }[] };
  const collabById = new Map((collabs ?? []).map((c) => [c.id, c]));
  const TYPE_LABEL: Record<EarningsLedgerRow["type"], string> = {
    collaboration_payout: "Collaboration payout",
    affiliate_reward: "Affiliate reward",
    referral_bonus: "Referral bonus",
  };
  const statement: StatementLine[] = rows.map((r) => {
    const c = r.collaboration_id ? collabById.get(r.collaboration_id) : undefined;
    return {
      id: r.id,
      date: r.created_at,
      type: r.type,
      status: r.status,
      amount: Number(r.amount),
      description: c?.campaign_title || TYPE_LABEL[r.type],
      counterparty: c?.brand_name || null,
    };
  });
  const sumByStatus = (status: EarningsLedgerRow["status"]) =>
    rows.filter((e) => e.status === status).reduce((acc, e) => acc + Number(e.amount), 0);

  const now = new Date();
  const monthBuckets: { key: string; month: string; amount: number }[] = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString("en-US", { month: "short" }), amount: 0 };
  });
  for (const row of rows) {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.amount += Number(row.amount);
  }

  return {
    entries: rows,
    statement,
    payoutMethods: payoutMethods ?? [],
    monthly: monthBuckets.map(({ month, amount }) => ({ month, amount })),
    totals: {
      totalEarned: rows.reduce((acc, e) => acc + Number(e.amount), 0),
      inTransit: sumByStatus("in_transit"),
      available: sumByStatus("available"),
      // A withdrawal that only partially consumes a payout row splits it in
      // two (see request_withdrawal in 0009_earnings_integrity.sql), so
      // counting rows would double-count a single collaboration's payout.
      paidCollaborations: new Set(
        rows.filter((e) => e.type === "collaboration_payout").map((e) => e.collaboration_id),
      ).size,
    },
  };
}

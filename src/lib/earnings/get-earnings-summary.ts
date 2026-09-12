import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EarningsLedgerRow, PayoutMethodRow } from "@/types/database";

export interface EarningsSummary {
  entries: EarningsLedgerRow[];
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

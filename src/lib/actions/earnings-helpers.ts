import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Records the simulated payout for a just-completed collaboration. A
 * SECURITY DEFINER RPC (see supabase/migrations/0009_earnings_integrity.sql)
 * since the amount must be re-derived from the collaboration's own
 * net_payout_to_creator rather than trusted from the client. Best-effort: a
 * failure here shouldn't roll back or block the status change itself.
 */
export async function recordCollaborationPayout(supabase: SupabaseClient<Database>, collaborationId: string) {
  try {
    await supabase.rpc("record_collaboration_payout", { p_collaboration_id: collaborationId });
  } catch (e) {
    console.error("recordCollaborationPayout failed (non-fatal):", e);
  }
}

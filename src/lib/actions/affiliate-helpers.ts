import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Redeems a referral code captured from an /invite/[type]/[code] link right
 * after onboarding. A SECURITY DEFINER RPC (see
 * supabase/migrations/0010_affiliate_integrity.sql) since the newly
 * onboarded user isn't the owner of the referral row they're updating.
 * Best-effort: an invalid/reused/self-referral code shouldn't block
 * onboarding, it just means no referral gets credited.
 */
export async function redeemReferralCode(supabase: SupabaseClient<Database>, code: string) {
  try {
    await supabase.rpc("redeem_referral_code", { p_code: code });
  } catch (e) {
    console.error("redeemReferralCode failed (non-fatal):", e);
  }
}

/**
 * Checks whether either party of a just-completed collaboration was
 * referred, and activates their referral if this was their first ever
 * completed (paid) collaboration. Best-effort: shouldn't block the
 * collaboration status change itself.
 */
export async function activateReferralsForCompletedCollaboration(
  supabase: SupabaseClient<Database>,
  collaborationId: string,
) {
  try {
    await supabase.rpc("activate_referrals_for_completed_collaboration", { p_collaboration_id: collaborationId });
  } catch (e) {
    console.error("activateReferralsForCompletedCollaboration failed (non-fatal):", e);
  }
}

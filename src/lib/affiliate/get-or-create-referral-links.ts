import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AffiliateReferralRow, Database, ReferralType } from "@/types/database";

const UNIQUE_VIOLATION = "23505";

function generateCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

async function getOrCreateReferral(
  supabase: SupabaseClient<Database>,
  referrerProfileId: string,
  referralType: ReferralType,
): Promise<AffiliateReferralRow> {
  const { data: existing } = await supabase
    .from("affiliate_referrals")
    .select("*")
    .eq("referrer_profile_id", referrerProfileId)
    .eq("referral_type", referralType)
    .maybeSingle();
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: inserted, error } = await supabase
      .from("affiliate_referrals")
      .insert({ referrer_profile_id: referrerProfileId, referral_type: referralType, referral_code: generateCode() })
      .select("*")
      .single();
    if (!error) return inserted;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(error.message);

    // Either the random code collided (retry with a new one) or a
    // concurrent request already created this creator's row for this type
    // (the referrer_profile_id + referral_type unique index) — in the
    // latter case that row is the real one to use.
    const { data: raceWinner } = await supabase
      .from("affiliate_referrals")
      .select("*")
      .eq("referrer_profile_id", referrerProfileId)
      .eq("referral_type", referralType)
      .maybeSingle();
    if (raceWinner) return raceWinner;
  }
  throw new Error("Could not generate a unique referral code");
}

export async function getOrCreateReferralLinks(supabase: SupabaseClient<Database>, referrerProfileId: string) {
  const [inviteBrand, inviteCreator] = await Promise.all([
    getOrCreateReferral(supabase, referrerProfileId, "invite_brand"),
    getOrCreateReferral(supabase, referrerProfileId, "invite_creator"),
  ]);
  return { inviteBrand, inviteCreator };
}

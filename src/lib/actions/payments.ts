"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CURRENCY } from "@/lib/constants";
import { getRequestOrigin } from "@/lib/auth/origin";
import { buildCheckoutUrl, createTracker } from "@/lib/safepay/client";
import { missingSafepayEnv } from "@/lib/safepay/config";
import { z } from "zod";

export interface CheckoutResult {
  error?: string;
  url?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Starts a Safepay checkout for an accepted deal. Everything that matters —
 * the price, the fee, the currency — is read from the database here; the
 * browser only says which deal. Returns the hosted-checkout URL to open.
 */
export async function startCheckoutAction(input: { collaborationId: string }): Promise<CheckoutResult> {
  const parsed = z.object({ collaborationId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { error: "Invalid deal." };

  const missing = missingSafepayEnv();
  if (missing.length > 0) return { error: "Payments aren't configured on this server yet." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  // RLS scopes this to the caller; the extra filters make the intent explicit.
  const { data: collab } = await supabase
    .from("collaborations")
    .select("id, status, agreed_price, brand_profile_id, campaign_title")
    .eq("id", parsed.data.collaborationId)
    .eq("brand_profile_id", user.id)
    .maybeSingle();
  if (!collab) return { error: "Deal not found." };
  if (collab.status !== "pending_payment") return { error: "This deal isn't waiting for payment." };

  const price = Number(collab.agreed_price);
  if (!(price > 0)) return { error: "This deal has no amount to pay." };

  const { data: settings } = await supabase.from("platform_settings").select("fee_percent").maybeSingle();
  const feePercent = Number(settings?.fee_percent ?? 10);
  const fee = round2((price * feePercent) / 100);
  const gross = round2(price + fee);

  const admin = createAdminClient();
  // Abandoned earlier attempts for this deal are closed so only one is live.
  await admin.from("payments").update({ status: "cancelled" }).eq("collaboration_id", collab.id).eq("status", "pending");

  const orderId = crypto.randomUUID();
  const { data: payment, error: insertError } = await admin
    .from("payments")
    .insert({
      collaboration_id: collab.id,
      brand_profile_id: user.id,
      order_id: orderId,
      price,
      platform_fee: fee,
      gross_amount: gross,
      currency: CURRENCY,
    })
    .select("id")
    .single();
  if (insertError || !payment) return { error: "Couldn't start the payment. Please try again." };

  try {
    const tracker = await createTracker({ amount: gross, currency: CURRENCY });
    await admin.from("payments").update({ tracker }).eq("id", payment.id);

    const origin = await getRequestOrigin();
    const url = buildCheckoutUrl({
      tracker,
      orderId,
      redirectUrl: `${origin}/dashboard/brand/payments/return`,
      cancelUrl: `${origin}/dashboard/brand/collaborations?payment=cancelled`,
    });
    return { url };
  } catch (e) {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return { error: e instanceof Error ? e.message : "Couldn't start the payment." };
  }
}

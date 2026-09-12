"use server";

import { createClient } from "@/lib/supabase/server";
import { payoutMethodSchema, withdrawalSchema } from "@/lib/validations/earnings";

export interface EarningsActionResult {
  error?: string;
}

export async function withdrawEarningsAction(input: unknown): Promise<EarningsActionResult> {
  const parsed = withdrawalSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error } = await supabase.rpc("request_withdrawal", { p_amount: parsed.data.amount });
  if (error) return { error: error.message };

  return {};
}

export async function savePayoutMethodAction(input: unknown): Promise<EarningsActionResult> {
  const parsed = payoutMethodSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { data: existing } = await supabase
    .from("payout_methods")
    .select("id")
    .eq("creator_profile_id", user.id)
    .eq("method_type", "bank_transfer")
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("payout_methods")
        .update({
          bank_account_holder: parsed.data.bankAccountHolder,
          bank_last_four: parsed.data.bankLastFour,
          is_active: true,
        })
        .eq("id", existing.id)
    : await supabase.from("payout_methods").insert({
        creator_profile_id: user.id,
        method_type: "bank_transfer",
        bank_account_holder: parsed.data.bankAccountHolder,
        bank_last_four: parsed.data.bankLastFour,
        is_active: true,
      });
  if (error) return { error: error.message };

  return {};
}

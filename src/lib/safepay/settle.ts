import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPayment, fromSafepayAmount } from "@/lib/safepay/client";

export type SettleResult = { status: "paid" | "pending" | "failed" | "unknown"; collaborationId?: string; reason?: string };

const dig = (obj: unknown, path: string[]): unknown =>
  path.reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
const firstDefined = (...vals: unknown[]) => vals.find((v) => v !== undefined && v !== null);

/**
 * Pulls the tracker state, amount and currency out of Safepay's payment record.
 * Kept in one tolerant function because the payload lives under `data` (and
 * sometimes `data.tracker`); anything we can't read is treated as "not paid".
 */
export function extractPayment(payload: unknown) {
  const state = firstDefined(dig(payload, ["data", "state"]), dig(payload, ["data", "tracker", "state"]));
  const amount = firstDefined(dig(payload, ["data", "amount"]), dig(payload, ["data", "tracker", "amount"]));
  const currency = firstDefined(dig(payload, ["data", "currency"]), dig(payload, ["data", "tracker", "currency"]));
  return {
    state: typeof state === "string" ? state : null,
    amount: typeof amount === "number" ? amount : typeof amount === "string" && amount !== "" ? Number(amount) : null,
    currency: typeof currency === "string" ? currency.toUpperCase() : null,
  };
}

const PAID_STATES = new Set(["TRACKER_ENDED", "PAID", "COMPLETED", "SUCCESS"]);
const FAILED_STATES = new Set(["TRACKER_FAILED", "FAILED", "CANCELLED", "EXPIRED", "TRACKER_CANCELLED"]);

/**
 * Confirms a payment with Safepay (never trusting the browser or the webhook
 * body alone) and, if it is really paid for the right amount, activates the
 * deal. Safe to call repeatedly: the webhook and the redirect both call it.
 */
export async function settlePayment(tracker: string, source: "webhook" | "redirect"): Promise<SettleResult> {
  const admin = createAdminClient();

  const { data: payment } = await admin.from("payments").select("*").eq("tracker", tracker).maybeSingle();
  if (!payment) return { status: "unknown", reason: "No payment for that tracker" };
  if (payment.status === "paid") return { status: "paid", collaborationId: payment.collaboration_id };

  const payload = await fetchPayment(tracker);
  await admin.from("payment_events").upsert(
    { dedupe_key: `${source}:${tracker}:${extractPayment(payload).state ?? "unknown"}`, tracker, source, payload: payload as Record<string, unknown> },
    { onConflict: "dedupe_key", ignoreDuplicates: true },
  );

  const { state, amount, currency } = extractPayment(payload);
  if (state && FAILED_STATES.has(state.toUpperCase())) {
    await admin.from("payments").update({ status: "failed", raw: payload as Record<string, unknown> }).eq("id", payment.id).eq("status", "pending");
    return { status: "failed", collaborationId: payment.collaboration_id, reason: state };
  }
  if (!state || !PAID_STATES.has(state.toUpperCase())) {
    return { status: "pending", collaborationId: payment.collaboration_id, reason: state ?? "state not readable" };
  }
  if (amount === null || currency === null) {
    return { status: "pending", collaborationId: payment.collaboration_id, reason: "amount or currency not readable" };
  }

  const { error } = await admin.rpc("apply_payment_success", {
    p_tracker: tracker,
    p_amount: fromSafepayAmount(amount),
    p_currency: currency,
    p_payload: payload as Record<string, unknown>,
  });
  if (error) return { status: "failed", collaborationId: payment.collaboration_id, reason: error.message };
  return { status: "paid", collaborationId: payment.collaboration_id };
}

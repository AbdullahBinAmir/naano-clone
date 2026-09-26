import "server-only";
import crypto from "node:crypto";
import { getSafepayConfig } from "@/lib/safepay/config";

/**
 * Safepay expresses `amount` in the currency's main unit (e.g. 25.5 = $25.50).
 * Everything that converts to or from Safepay's number goes through here so the
 * unit is decided in exactly one place.
 */
export const toSafepayAmount = (amount: number) => Math.round(amount * 100) / 100;
export const fromSafepayAmount = (amount: number) => Math.round(amount * 100) / 100;

/** POST /order/v1/init — creates a payment "tracker" (Safepay's payment token). */
export async function createTracker(input: { amount: number; currency: "USD" | "PKR" }): Promise<string> {
  const cfg = getSafepayConfig();
  const res = await fetch(`${cfg.apiBase}/order/v1/init`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client: cfg.apiKey,
      amount: toSafepayAmount(input.amount),
      currency: input.currency,
      environment: cfg.env,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as { data?: { token?: string }; status?: { message?: string } } | null;
  const token = json?.data?.token;
  if (!res.ok || !token) {
    throw new Error(`Safepay couldn't start the payment${json?.status?.message ? `: ${json.status.message}` : ""}.`);
  }
  return token;
}

/** Hosted checkout URL the brand is sent to. */
export function buildCheckoutUrl(input: { tracker: string; orderId: string; redirectUrl: string; cancelUrl: string }): string {
  const cfg = getSafepayConfig();
  const params = new URLSearchParams({
    beacon: input.tracker,
    cancel_url: input.cancelUrl,
    env: cfg.env,
    order_id: input.orderId,
    redirect_url: input.redirectUrl,
    source: "custom",
    webhooks: "true",
  });
  return `${cfg.checkoutBase}?${params.toString()}`;
}

/**
 * Server-to-server read of a payment's state (GET /order/v1/{tracker}, which
 * returns `data.state`, `data.amount` and `data.currency`). This — not the
 * browser redirect — is what we trust. The reporter API only knows a tracker
 * once a payment attempt exists, so it isn't used for this check.
 */
export async function fetchPayment(tracker: string): Promise<unknown> {
  const cfg = getSafepayConfig();
  const res = await fetch(`${cfg.apiBase}/order/v1/${encodeURIComponent(tracker)}`, {
    headers: { "x-sfpy-merchant-secret": cfg.secretKey },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Safepay payment lookup failed (${res.status}).`);
  return res.json();
}

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

/** Redirect signature: HMAC-SHA256(tracker) with the merchant secret, hex. */
export function verifyRedirectSignature(tracker: string, sig: string): boolean {
  const expected = crypto.createHmac("sha256", getSafepayConfig().secretKey).update(tracker).digest("hex");
  return safeEqual(sig, expected);
}

/**
 * Webhook signature: HMAC-SHA512 of the JSON `data` object with the webhook
 * secret, hex, in the `x-sfpy-signature` header. Confirmed against real
 * deliveries from Safepay's sandbox.
 */
export function verifyWebhookSignature(data: unknown, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", getSafepayConfig().webhookSecret).update(JSON.stringify(data)).digest("hex");
  return safeEqual(signature.trim().toLowerCase(), expected);
}

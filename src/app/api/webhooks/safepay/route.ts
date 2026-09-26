import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/safepay/client";
import { missingSafepayEnv } from "@/lib/safepay/config";
import { settlePayment } from "@/lib/safepay/settle";

// Safepay calls this after a payment event. We verify the signature, then
// re-confirm the payment with Safepay itself (settlePayment) instead of
// believing the body, so a forged or replayed request can't fund a deal.
export async function POST(request: Request) {
  if (missingSafepayEnv().length > 0) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const rawText = await request.text();
  let body: { data?: Record<string, unknown> } | null = null;
  try {
    body = JSON.parse(rawText);
  } catch {
    body = null;
  }
  if (!body?.data || !verifyWebhookSignature({ data: body.data, body, rawText }, request.headers.get("x-sfpy-signature"))) {
    // Diagnostic switch for first-time setup: with SAFEPAY_WEBHOOK_DEBUG=1 a rejected
    // delivery is kept (headers minus secrets, plus body) so a wrong secret or an
    // unexpected format can be diagnosed. Off by default — otherwise anyone could
    // write rows here.
    if (process.env.SAFEPAY_WEBHOOK_DEBUG === "1") {
      await createAdminClient()
        .from("payment_events")
        .upsert(
          {
            dedupe_key: `webhook_rejected:${crypto.createHash("sha256").update(rawText).digest("hex")}`,
            tracker: null,
            source: "webhook_rejected",
            payload: {
              signaturePresent: !!request.headers.get("x-sfpy-signature"),
              headerNames: [...request.headers.keys()].filter((h) => !["authorization", "cookie"].includes(h)),
              userAgent: request.headers.get("user-agent"),
              body: rawText.slice(0, 4000),
            },
          },
          { onConflict: "dedupe_key", ignoreDuplicates: true },
        );
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = body.data as { token?: string; tracker?: string | { token?: string }; notification?: { tracker?: string } };
  const tracker =
    (typeof data.tracker === "string" ? data.tracker : data.tracker?.token) ?? data.token ?? data.notification?.tracker;

  // Keep every verified delivery (deduped by content) so what Safepay really sends can be audited.
  await createAdminClient()
    .from("payment_events")
    .upsert(
      {
        dedupe_key: `webhook:${crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex")}`,
        tracker: tracker ?? null,
        source: "webhook",
        payload: body as Record<string, unknown>,
      },
      { onConflict: "dedupe_key", ignoreDuplicates: true },
    );

  if (!tracker) return NextResponse.json({ ok: true, ignored: "no tracker" });

  try {
    const result = await settlePayment(tracker, "webhook");
    return NextResponse.json({ ok: true, status: result.status });
  } catch (e) {
    console.error("Safepay webhook settle failed:", e);
    // 500 asks Safepay to retry later.
    return NextResponse.json({ error: "Settlement failed" }, { status: 500 });
  }
}

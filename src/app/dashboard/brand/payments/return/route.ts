import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/safepay/settle";
import { verifyRedirectSignature } from "@/lib/safepay/client";
import { missingSafepayEnv } from "@/lib/safepay/config";

// Where Safepay sends the brand's browser after checkout (GET with query
// params, or a form POST). The redirect is only a *hint*: we verify its
// signature and then confirm the payment with Safepay server-to-server before
// activating anything.
async function handle(request: Request) {
  const url = new URL(request.url);
  const dest = (state: string) => NextResponse.redirect(new URL(`/dashboard/brand/collaborations?payment=${state}`, url), 303);

  let tracker = url.searchParams.get("tracker");
  let sig = url.searchParams.get("sig");
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    tracker = tracker ?? (form?.get("tracker") as string | null) ?? null;
    sig = sig ?? (form?.get("sig") as string | null) ?? null;
  }
  if (!tracker || missingSafepayEnv().length > 0) return dest("error");
  if (sig && !verifyRedirectSignature(tracker, sig)) return dest("error");

  try {
    const result = await settlePayment(tracker, "redirect");
    return dest(result.status === "paid" ? "success" : result.status === "pending" ? "pending" : "failed");
  } catch (e) {
    console.error("Safepay redirect settle failed:", e);
    return dest("error");
  }
}

export const GET = handle;
export const POST = handle;

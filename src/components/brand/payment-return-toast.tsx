"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, { kind: "success" | "error" | "info"; text: string }> = {
  success: { kind: "success", text: "Payment received — the deal is now active." },
  pending: { kind: "info", text: "Payment is still being confirmed. This page updates when it clears." },
  failed: { kind: "error", text: "The payment didn't go through. You can try again from the deal." },
  cancelled: { kind: "info", text: "Checkout cancelled — nothing was charged." },
  error: { kind: "error", text: "We couldn't confirm that payment. If you were charged, contact support." },
};

/** Announces the outcome of a Safepay checkout once, then clears the ?payment= flag from the URL. */
export function PaymentReturnToast({ state }: { state: string | null }) {
  const router = useRouter();
  React.useEffect(() => {
    if (!state || !MESSAGES[state]) return;
    const m = MESSAGES[state];
    toast[m.kind](m.text);
    router.replace("/dashboard/brand/collaborations");
  }, [state, router]);
  return null;
}

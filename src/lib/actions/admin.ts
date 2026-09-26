"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface AdminActionResult {
  error?: string;
}

// The SQL functions re-check is_admin(); this only shapes input and refreshes pages.
async function callAdminRpc(run: (supabase: Awaited<ReturnType<typeof createClient>>) => PromiseLike<{ error: { message: string } | null }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };
  const { error } = await run(supabase);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin", "layout");
  return {};
}

const text = z.string().trim().max(500).optional().default("");

export async function setPayoutStatusAction(input: unknown): Promise<AdminActionResult> {
  const parsed = z
    .object({ requestId: z.string().uuid(), status: z.enum(["processing", "paid", "failed"]), reference: text, note: text })
    .safeParse(input);
  if (!parsed.success) return { error: "Invalid input." };
  return callAdminRpc((s) =>
    s.rpc("admin_set_payout_status", {
      p_request_id: parsed.data.requestId,
      p_status: parsed.data.status,
      p_reference: parsed.data.reference,
      p_note: parsed.data.note,
    }),
  );
}

export async function resolveDisputeAction(input: unknown): Promise<AdminActionResult> {
  const parsed = z
    .object({ disputeId: z.string().uuid(), resolution: z.enum(["release", "refund"]), note: text, refundReference: text })
    .safeParse(input);
  if (!parsed.success) return { error: "Invalid input." };
  return callAdminRpc((s) =>
    s.rpc("resolve_dispute", {
      p_dispute_id: parsed.data.disputeId,
      p_resolution: parsed.data.resolution,
      p_note: parsed.data.note,
      p_refund_reference: parsed.data.refundReference,
    }),
  );
}

export async function refundCollaborationAction(input: unknown): Promise<AdminActionResult> {
  const parsed = z.object({ collaborationId: z.string().uuid(), note: text, refundReference: text }).safeParse(input);
  if (!parsed.success) return { error: "Invalid input." };
  return callAdminRpc((s) =>
    s.rpc("admin_refund_collaboration", {
      p_collaboration_id: parsed.data.collaborationId,
      p_note: parsed.data.note,
      p_refund_reference: parsed.data.refundReference,
    }),
  );
}

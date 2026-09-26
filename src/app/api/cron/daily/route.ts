import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Runs once a day (see vercel.json). Vercel sends `Authorization: Bearer <CRON_SECRET>`.
//  * auto-approves posts the brand hasn't reviewed within `auto_approve_days`
//  * cancels deals the brand never paid within `unpaid_expiry_days`
// Both steps live in service-role-only SQL functions (migration 0024).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret ?? ""}`;
  const ok =
    !!secret && given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const [approved, expired] = await Promise.all([
    admin.rpc("auto_approve_due_collaborations"),
    admin.rpc("expire_unpaid_collaborations"),
  ]);
  if (approved.error || expired.error) {
    console.error("cron/daily failed:", approved.error?.message, expired.error?.message);
    return NextResponse.json({ error: approved.error?.message ?? expired.error?.message }, { status: 500 });
  }
  return NextResponse.json({ autoApproved: approved.data ?? 0, expiredUnpaid: expired.data ?? 0 });
}

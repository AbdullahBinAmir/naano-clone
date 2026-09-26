import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client. It BYPASSES Row Level Security, so it is only for the
 * verified payment webhook / redirect handler and other trusted server jobs —
 * never for anything a user's request can steer directly. Requires
 * SUPABASE_SECRET_KEY (server-only; never prefix it with NEXT_PUBLIC_).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

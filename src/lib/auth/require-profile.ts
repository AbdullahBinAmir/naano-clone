import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

/**
 * Server-side route guard for the role-scoped dashboard layouts. Redirects
 * to sign-in (no session), onboarding (no profile row yet), or the other
 * role's dashboard (wrong role) — never renders the guarded layout unless
 * the session and role both check out.
 */
export async function requireProfile(expectedRole: AppRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/onboarding");
  if (profile.role !== expectedRole) {
    redirect(profile.role === "creator" ? "/dashboard/creator/overview" : "/dashboard/brand/overview");
  }

  return { user, profile };
}

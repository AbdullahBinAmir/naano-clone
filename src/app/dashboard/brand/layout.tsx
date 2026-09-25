import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BRAND_NAV } from "@/lib/constants";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getCollabStats } from "@/lib/dashboard/get-collab-stats";

export default async function BrandDashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireProfile("brand");

  const supabase = await createClient();
  const [{ data: brandProfile }, stats] = await Promise.all([
    supabase.from("brand_profiles").select("company_name, logo_url").eq("profile_id", user.id).maybeSingle(),
    getCollabStats(supabase, user.id, "brand"),
  ]);

  const identity = {
    displayName: brandProfile?.company_name || profile.email,
    avatarUrl: brandProfile?.logo_url || null,
    email: profile.email,
  };

  return (
    <DashboardShell role="brand" navItems={BRAND_NAV} identity={identity} stats={stats}>
      {children}
    </DashboardShell>
  );
}

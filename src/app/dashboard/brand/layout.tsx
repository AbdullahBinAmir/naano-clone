import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BRAND_NAV } from "@/lib/constants";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export default async function BrandDashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireProfile("brand");

  const supabase = await createClient();
  const { data: brandProfile } = await supabase
    .from("brand_profiles")
    .select("company_name, logo_url")
    .eq("profile_id", user.id)
    .maybeSingle();

  const identity = {
    displayName: brandProfile?.company_name || profile.email,
    avatarUrl: brandProfile?.logo_url || null,
    email: profile.email,
  };

  return (
    <DashboardShell role="brand" navItems={BRAND_NAV} identity={identity}>
      {children}
    </DashboardShell>
  );
}

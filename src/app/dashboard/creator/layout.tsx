import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CREATOR_NAV } from "@/lib/constants";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export default async function CreatorDashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireProfile("creator");

  const supabase = await createClient();
  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("display_name, avatar_url")
    .eq("profile_id", user.id)
    .maybeSingle();

  const identity = {
    displayName: creatorProfile?.display_name || profile.email,
    avatarUrl: creatorProfile?.avatar_url || null,
    email: profile.email,
  };

  return (
    <DashboardShell role="creator" navItems={CREATOR_NAV} identity={identity}>
      {children}
    </DashboardShell>
  );
}

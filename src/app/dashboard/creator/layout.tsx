import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CREATOR_NAV } from "@/lib/constants";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getCollabStats } from "@/lib/dashboard/get-collab-stats";
import { getNotifications } from "@/lib/notifications/get-notifications";

export default async function CreatorDashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireProfile("creator");

  const supabase = await createClient();
  const [{ data: creatorProfile }, { data: card }, { data: available }, stats, notifications] = await Promise.all([
    supabase.from("creator_profiles").select("display_name, avatar_url, handle").eq("profile_id", user.id).maybeSingle(),
    supabase.from("creator_cards").select("published_at").eq("creator_profile_id", user.id).maybeSingle(),
    supabase.from("earnings_ledger").select("amount").eq("creator_profile_id", user.id).eq("status", "available"),
    getCollabStats(supabase, user.id, "creator"),
    getNotifications(supabase, user.id, "creator"),
  ]);

  const identity = {
    displayName: creatorProfile?.display_name || profile.email,
    avatarUrl: creatorProfile?.avatar_url || null,
    email: profile.email,
  };
  const publicCardHandle = card?.published_at ? (creatorProfile?.handle ?? null) : null;
  const walletBalance = (available ?? []).reduce((acc, e) => acc + Number(e.amount), 0);

  return (
    <DashboardShell role="creator" navItems={CREATOR_NAV} identity={identity} stats={stats} notifications={notifications} walletBalance={walletBalance}
      publicCardHandle={publicCardHandle}
    >
      {children}
    </DashboardShell>
  );
}

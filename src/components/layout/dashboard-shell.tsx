import * as React from "react";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { DashboardAssistant } from "@/components/layout/dashboard-assistant";
import type { CollabStats } from "@/lib/dashboard/get-collab-stats";

export interface DashboardIdentity {
  displayName: string;
  avatarUrl: string | null;
  email: string;
}

export function DashboardShell({
  role,
  navItems,
  identity,
  stats,
  walletBalance,
  publicCardHandle,
  children,
}: {
  role: "creator" | "brand";
  navItems: readonly NavItem[];
  identity: DashboardIdentity;
  stats: CollabStats;
  walletBalance?: number;
  /** Creator only: handle of their published card, or null if not published yet. */
  publicCardHandle?: string | null;
  children: React.ReactNode;
}) {
  const collaborationsHref = `/dashboard/${role}/collaborations`;
  // The collaborations nav icon carries the real needs-action count.
  const badges = { [collaborationsHref]: stats.needsAction };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[110rem] flex-col px-4 sm:px-6 lg:px-10">
      <Topbar
        role={role}
        identity={identity}
        stats={stats}
        collaborationsHref={collaborationsHref}
        navItems={navItems}
        badges={badges}
        walletBalance={walletBalance}
      />
      <div className="flex flex-1 gap-6 lg:gap-8">
        <aside className="sticky top-28 hidden h-[calc(100svh-8rem)] shrink-0 self-start pb-4 md:block">
          <div className="flex h-full w-[4.75rem] flex-col items-center justify-between rounded-xl border border-border bg-card py-5">
            <Sidebar items={navItems} badges={badges} />
            <SignOutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-28">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">{children}</div>
        </main>
      </div>
      <DashboardAssistant role={role} navItems={navItems} publicCardHandle={publicCardHandle ?? null} />
    </div>
  );
}

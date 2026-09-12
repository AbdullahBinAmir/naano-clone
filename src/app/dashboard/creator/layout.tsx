import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CREATOR_NAV } from "@/lib/constants";

export default function CreatorDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="creator" navItems={CREATOR_NAV}>
      {children}
    </DashboardShell>
  );
}

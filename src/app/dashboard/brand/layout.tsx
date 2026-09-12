import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BRAND_NAV } from "@/lib/constants";

export default function BrandDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="brand" navItems={BRAND_NAV}>
      {children}
    </DashboardShell>
  );
}

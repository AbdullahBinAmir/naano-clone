import * as React from "react";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { DashboardAssistant } from "@/components/layout/dashboard-assistant";
import { MobileNav } from "@/components/layout/mobile-nav";

export function DashboardShell({
  role,
  navItems,
  children,
}: {
  role: "creator" | "brand";
  navItems: readonly NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Topbar role={role} />
      <div className="mx-auto flex w-full max-w-[100rem] flex-1">
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border md:block">
          <Sidebar items={navItems} />
        </aside>
        <div className="border-b border-border px-4 py-2 md:hidden">
          <MobileNav items={navItems} />
        </div>
        <main className="min-w-0 flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">{children}</div>
        </main>
      </div>
      <DashboardAssistant role={role} navItems={navItems} />
    </div>
  );
}

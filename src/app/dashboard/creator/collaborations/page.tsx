"use client";

import * as React from "react";
import Image from "next/image";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useCreatorPersona } from "@/hooks/use-creator-persona";
import { formatCurrency } from "@/lib/utils";
import type { Collaboration, CollaborationStatus } from "@/types/domain";

const TABS: { key: "all" | CollaborationStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "needs_action", label: "Needs action" },
  { key: "applied", label: "Applications sent" },
  { key: "declined", label: "Declined" },
  { key: "completed", label: "Completed" },
];

const STATUS_VARIANT: Record<CollaborationStatus, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  applied: "neutral",
  needs_action: "warning",
  active: "accent",
  declined: "danger",
  completed: "success",
};

const STATUS_LABEL: Record<CollaborationStatus, string> = {
  applied: "Applied",
  needs_action: "Needs action",
  active: "Active",
  declined: "Declined",
  completed: "Completed",
};

export default function CollaborationsPage() {
  const { collaborations } = useCreatorPersona();
  const [tab, setTab] = React.useState<"all" | CollaborationStatus>("all");

  const columns: Column<Collaboration>[] = [
    {
      header: "Brand",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="glass-surface relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
            <Image src={row.brandLogoUrl} alt="" fill sizes="28px" className="object-contain p-1" />
          </span>
          <span className="font-medium">{row.brandName}</span>
        </div>
      ),
    },
    { header: "Campaign", cell: (row) => <span className="text-foreground-muted">{row.campaignTitle}</span> },
    { header: "Status", cell: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge> },
    {
      header: "Performance",
      cell: (row) =>
        row.performanceReach.length ? (
          <MiniSparkline points={row.performanceReach} />
        ) : (
          <span className="text-foreground-subtle">—</span>
        ),
    },
    { header: "Next action", cell: (row) => <span className="text-foreground-muted">{row.nextActionText}</span> },
    {
      header: "Due date",
      cell: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString() : <span className="text-foreground-subtle">—</span>),
    },
    { header: "Your net", cell: (row) => <span className="font-medium">{formatCurrency(row.netPayoutToCreator)}</span> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Collaborations"
        title="Collaborations"
        description="Every step tells you where you stand, what to do, and what happens if you do nothing."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsIndicator />
          {TABS.map((t) => {
            const count = t.key === "all" ? collaborations.length : collaborations.filter((c) => c.status === t.key).length;
            return (
              <TabsTab key={t.key} value={t.key}>
                {t.label}
                <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[11px] tabular-nums">{count}</span>
              </TabsTab>
            );
          })}
        </TabsList>

        {TABS.map((t) => {
          const rows = t.key === "all" ? collaborations : collaborations.filter((c) => c.status === t.key);
          return (
            <TabsPanel key={t.key} value={t.key} className="mt-4">
              <DataTable
                columns={columns}
                rows={rows}
                rowKey={(row) => row.id}
                emptyState={
                  <div className="flex flex-col items-center gap-2 text-foreground-muted">
                    <Inbox className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
                    No collaborations yet. Brand invitations and your accepted applications land here.
                  </div>
                }
              />
            </TabsPanel>
          );
        })}
      </Tabs>
    </>
  );
}

function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points, 1);
  const w = 80;
  const h = 24;
  const step = w / (points.length - 1 || 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (p / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-accent">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

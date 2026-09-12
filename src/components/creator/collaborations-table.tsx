"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { updateCollaborationStatusAction } from "@/lib/actions/collaborations";
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

/**
 * Shared between the creator and brand Collaborations pages — which actions
 * are available (and what "counterpart" column to show) depends on
 * `viewer`, since a collaboration's status machine treats the two roles
 * differently (see lib/actions/collaborations.ts).
 */
export interface CollaborationWithCounterpart extends Collaboration {
  counterpartName: string;
  counterpartLogoUrl: string;
}

export function CollaborationsTable({
  collaborations,
  viewer,
  counterpartLabel,
}: {
  collaborations: CollaborationWithCounterpart[];
  viewer: "creator" | "brand";
  counterpartLabel: string;
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState<"all" | CollaborationStatus>("all");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function act(id: string, action: "accept" | "decline" | "complete") {
    setPendingId(id);
    const result = await updateCollaborationStatusAction({ collaborationId: id, action });
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(action === "accept" ? "Accepted" : action === "decline" ? "Declined" : "Marked as posted");
    router.refresh();
  }

  const canAct = (row: CollaborationWithCounterpart) =>
    (viewer === "brand" && row.status === "applied") ||
    (viewer === "creator" && row.status === "needs_action") ||
    (viewer === "creator" && row.status === "active");

  const columns: Column<CollaborationWithCounterpart>[] = [
    {
      header: counterpartLabel,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="glass-surface relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
            {row.counterpartLogoUrl && (
              <Image src={row.counterpartLogoUrl} alt="" fill sizes="28px" className="object-contain p-1" />
            )}
          </span>
          <span className="font-medium">{row.counterpartName}</span>
        </div>
      ),
    },
    { header: "Campaign", cell: (row) => <span className="text-foreground-muted">{row.campaignTitle}</span> },
    { header: "Status", cell: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge> },
    { header: "Next action", cell: (row) => <span className="text-foreground-muted">{row.nextActionText}</span> },
    {
      header: "Due date",
      cell: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString() : <span className="text-foreground-subtle">—</span>),
    },
    {
      header: viewer === "creator" ? "Your net" : "Budget",
      cell: (row) => <span className="font-medium">{formatCurrency(viewer === "creator" ? row.netPayoutToCreator : row.agreedPrice)}</span>,
    },
    {
      header: "",
      cell: (row) => {
        if (!canAct(row)) return null;
        const busy = pendingId === row.id;
        if (row.status === "active") {
          return (
            <Button size="sm" variant="glass" onClick={() => act(row.id, "complete")} disabled={busy}>
              {busy ? "…" : "Mark posted"}
            </Button>
          );
        }
        return (
          <div className="flex gap-1.5">
            <Button size="sm" variant="primary" onClick={() => act(row.id, "accept")} disabled={busy}>
              {busy ? "…" : "Accept"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => act(row.id, "decline")} disabled={busy}>
              Decline
            </Button>
          </div>
        );
      },
    },
  ];

  return (
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
                  No collaborations yet.
                </div>
              }
            />
          </TabsPanel>
        );
      })}
    </Tabs>
  );
}

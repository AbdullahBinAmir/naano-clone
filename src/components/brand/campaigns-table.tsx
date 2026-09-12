"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { updateCampaignStatusAction } from "@/lib/actions/campaigns";
import { formatCurrency } from "@/lib/utils";
import type { Campaign, CampaignStatus } from "@/types/domain";

const STATUS_VARIANT: Record<CampaignStatus, "neutral" | "accent" | "danger"> = {
  draft: "neutral",
  published: "accent",
  closed: "danger",
};

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function setStatus(campaignId: string, status: CampaignStatus) {
    setPendingId(campaignId);
    const result = await updateCampaignStatusAction({ campaignId, status });
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(status === "published" ? "Campaign published" : "Campaign closed");
    router.refresh();
  }

  const columns: Column<Campaign>[] = [
    { header: "Campaign", cell: (row) => <span className="font-medium">{row.title}</span> },
    { header: "Vertical", cell: (row) => <span className="text-foreground-muted">{row.targetVertical}</span> },
    { header: "Status", cell: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge> },
    { header: "Budget", cell: (row) => formatCurrency(row.budget) },
    { header: "Created", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "",
      cell: (row) => {
        const busy = pendingId === row.id;
        if (row.status === "draft") {
          return (
            <Button size="sm" variant="primary" onClick={() => setStatus(row.id, "published")} disabled={busy}>
              {busy ? "…" : "Publish"}
            </Button>
          );
        }
        if (row.status === "published") {
          return (
            <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "closed")} disabled={busy}>
              {busy ? "…" : "Close"}
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Campaigns" title="Campaigns" description="Publish, track, and pay — all from one place." />
      <DataTable
        columns={columns}
        rows={campaigns}
        rowKey={(row) => row.id}
        emptyState={
          <div className="flex flex-col items-center gap-2 text-foreground-muted">
            <Inbox className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
            No campaigns yet. Create a brief to get started.
          </div>
        }
      />
    </>
  );
}

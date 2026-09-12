"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useBrandPersona } from "@/hooks/use-brand-persona";
import { formatCurrency } from "@/lib/utils";
import type { Campaign, CampaignStatus } from "@/types/domain";
import { Inbox } from "lucide-react";

const STATUS_VARIANT: Record<CampaignStatus, "neutral" | "accent" | "danger"> = {
  draft: "neutral",
  published: "accent",
  closed: "danger",
};

export default function CampaignsPage() {
  const { campaigns } = useBrandPersona();

  const columns: Column<Campaign>[] = [
    { header: "Campaign", cell: (row) => <span className="font-medium">{row.title}</span> },
    { header: "Vertical", cell: (row) => <span className="text-foreground-muted">{row.targetVertical}</span> },
    { header: "Status", cell: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge> },
    { header: "Budget", cell: (row) => formatCurrency(row.budget) },
    { header: "Created", cell: (row) => new Date(row.createdAt).toLocaleDateString() },
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

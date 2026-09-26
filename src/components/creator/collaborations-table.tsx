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
import { submitPostAction, updateCollaborationStatusAction } from "@/lib/actions/collaborations";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { DisputeDialog } from "@/components/collaborations/dispute-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Collaboration, CollaborationStatus } from "@/types/domain";

const TABS: { key: "all" | CollaborationStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "needs_action", label: "Needs action" },
  { key: "pending_payment", label: "Awaiting payment" },
  { key: "in_review", label: "In review" },
  { key: "disputed", label: "Disputed" },
  { key: "applied", label: "Applications sent" },
  { key: "declined", label: "Declined" },
  { key: "completed", label: "Completed" },
];

const STATUS_VARIANT: Record<CollaborationStatus, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  applied: "neutral",
  needs_action: "warning",
  pending_payment: "warning",
  in_review: "warning",
  disputed: "danger",
  active: "accent",
  declined: "danger",
  refunded: "neutral",
  completed: "success",
};

const STATUS_LABEL: Record<CollaborationStatus, string> = {
  applied: "Applied",
  needs_action: "Needs action",
  pending_payment: "Awaiting payment",
  in_review: "In review",
  disputed: "Disputed",
  active: "Active",
  declined: "Declined",
  refunded: "Refunded",
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
  const [submitTarget, setSubmitTarget] = React.useState<CollaborationWithCounterpart | null>(null);
  const [disputeId, setDisputeId] = React.useState<string | null>(null);
  const [postUrl, setPostUrl] = React.useState("");
  const [postUrlError, setPostUrlError] = React.useState<string | undefined>();

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

  async function submitPost() {
    if (!submitTarget) return;
    setPendingId(submitTarget.id);
    setPostUrlError(undefined);
    const result = await submitPostAction({ collaborationId: submitTarget.id, postUrl });
    setPendingId(null);
    if (result.error) {
      setPostUrlError(result.error);
      return;
    }
    toast.success("Post submitted — the brand will review it");
    setSubmitTarget(null);
    setPostUrl("");
    router.refresh();
  }

  const canAct = (row: CollaborationWithCounterpart) =>
    (viewer === "brand" && row.status === "applied") ||
    (viewer === "creator" && row.status === "needs_action") ||
    (viewer === "creator" && row.status === "active") ||
    // Either side can dispute a paid deal that is in progress.
    (!!row.fundedAt && (row.status === "active" || row.status === "in_review"));

  const columns: Column<CollaborationWithCounterpart>[] = [
    {
      header: counterpartLabel,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="border border-border bg-card-raised relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
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
    {
      header: "Next action",
      cell: (row) => (
        <span className="text-foreground-muted">
          {row.nextActionText}
          {row.status === "active" && row.revisionNote ? (
            <span className="mt-1 block text-[13px] text-warning">“{row.revisionNote}”</span>
          ) : null}
        </span>
      ),
    },
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
        const canDispute = !!row.fundedAt && (row.status === "active" || row.status === "in_review");
        const disputeButton = canDispute ? (
          <Button size="sm" variant="ghost" onClick={() => setDisputeId(row.id)} disabled={busy}>
            Dispute
          </Button>
        ) : null;
        if (row.status === "in_review") return <div className="flex gap-1.5">{disputeButton}</div>;
        if (row.status === "active" && row.fundedAt) {
          return (
            <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setPostUrl(row.postUrl ?? "");
                setPostUrlError(undefined);
                setSubmitTarget(row);
              }}
              disabled={busy}
            >
              {row.revisionNote ? "Resubmit post" : "Submit post"}
            </Button>
            {disputeButton}
            </div>
          );
        }
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

      <Dialog open={submitTarget !== null} onOpenChange={(open) => !open && setSubmitTarget(null)}>
        <DialogContent>
          <DialogTitle>Submit your post</DialogTitle>
          <DialogDescription className="mt-2">
            Paste the link to your published LinkedIn post. {submitTarget?.counterpartName} reviews it, and your{" "}
            {submitTarget ? formatCurrency(submitTarget.netPayoutToCreator) : ""} payout is released on approval.
          </DialogDescription>
          <div className="mt-4">
            <TextField
              label="LinkedIn post URL"
              type="url"
              placeholder="https://www.linkedin.com/posts/…"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              error={postUrlError}
            />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant="primary" onClick={submitPost} disabled={pendingId !== null || !postUrl.trim()}>
              {pendingId !== null ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DisputeDialog
        collaborationId={disputeId}
        open={disputeId !== null}
        onOpenChange={(o) => !o && setDisputeId(null)}
        onOpened={() => router.refresh()}
      />
    </Tabs>
  );
}

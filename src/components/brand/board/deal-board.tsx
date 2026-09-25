"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateCollaborationStatusAction } from "@/lib/actions/collaborations";
import type { BoardDeal } from "@/lib/brand/get-brand-deals";
import type { CollaborationStatus } from "@/types/database";
import { cn, formatCurrency, initials } from "@/lib/utils";

interface Column {
  status: CollaborationStatus;
  title: string;
  hint: string;
}

const COLUMNS: Column[] = [
  { status: "applied", title: "Pitches", hint: "Drag to Active to accept, or to Declined" },
  { status: "needs_action", title: "Awaiting creator", hint: "Offers you sent — the creator responds" },
  { status: "active", title: "Active", hint: "Creators publish their posts" },
  { status: "completed", title: "Completed", hint: "Marked as posted by the creator" },
  { status: "declined", title: "Declined", hint: "Closed without a booking" },
];

/**
 * The moves a brand may make, mirroring update_collaboration_status (the DB
 * enforces it; this just keeps the board from offering impossible drops):
 * a brand can only accept or decline an application. Every other transition
 * belongs to the creator (accept/decline an offer, mark posted).
 */
const BRAND_MOVES: Partial<Record<CollaborationStatus, Partial<Record<CollaborationStatus, "accept" | "decline">>>> = {
  applied: { active: "accept", declined: "decline" },
};

const canMove = (from: CollaborationStatus, to: CollaborationStatus) => !!BRAND_MOVES[from]?.[to];

export function DealBoard({ deals: initialDeals }: { deals: BoardDeal[] }) {
  const router = useRouter();
  const [deals, setDeals] = React.useState(initialDeals);
  const [seen, setSeen] = React.useState(initialDeals);
  const [dragging, setDragging] = React.useState<BoardDeal | null>(null);
  const [overColumn, setOverColumn] = React.useState<CollaborationStatus | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Fresh server data (after router.refresh) replaces the optimistic copy.
  if (initialDeals !== seen) {
    setSeen(initialDeals);
    setDeals(initialDeals);
  }

  async function move(deal: BoardDeal, to: CollaborationStatus) {
    const action = BRAND_MOVES[deal.status]?.[to];
    if (!action) {
      toast.error(
        deal.status === "needs_action"
          ? "Only the creator can respond to an offer you sent."
          : deal.status === "active"
            ? "Only the creator can mark an active deal as posted."
            : "That deal can't be moved there.",
      );
      return;
    }

    const previous = deals;
    setBusyId(deal.id);
    setDeals((cur) => cur.map((d) => (d.id === deal.id ? { ...d, status: to } : d)));
    const result = await updateCollaborationStatusAction({ collaborationId: deal.id, action });
    setBusyId(null);

    if (result.error) {
      setDeals(previous);
      toast.error(result.error);
      return;
    }
    toast.success(action === "accept" ? "Pitch accepted — deal is active" : "Pitch declined");
    router.refresh();
  }

  return (
    <div className="grid auto-cols-[minmax(13.5rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const items = deals.filter((d) => d.status === col.status);
        const droppable = dragging ? canMove(dragging.status, col.status) : false;
        const dimmed = dragging !== null && dragging.status !== col.status && !droppable;

        return (
          <section
            key={col.status}
            aria-label={`${col.title}, ${items.length} deals`}
            onDragOver={(e) => {
              if (!droppable) return;
              e.preventDefault();
              setOverColumn(col.status);
            }}
            onDragLeave={() => setOverColumn((cur) => (cur === col.status ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              setOverColumn(null);
              if (dragging && droppable) void move(dragging, col.status);
              setDragging(null);
            }}
            className={cn(
              "flex min-h-72 flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-[opacity,box-shadow] duration-150",
              droppable && "ring-1 ring-accent/50",
              overColumn === col.status && "ring-2 ring-accent bg-accent-muted",
              dimmed && "opacity-40",
            )}
          >
            <header>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{col.title}</h2>
                <span className="rounded-full bg-card-raised px-2.5 py-0.5 text-[13px] font-medium text-foreground-muted tabular-nums">
                  {items.length}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-foreground-muted">{col.hint}</p>
            </header>

            {items.length === 0 ? (
              <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border px-3 py-8 text-center text-[13px] text-foreground-subtle">
                {droppable ? "Drop here" : "Nothing here"}
              </p>
            ) : (
              items.map((d) => {
                const movable = !!BRAND_MOVES[d.status];
                const busy = busyId === d.id;
                return (
                  <Card
                    key={d.id}
                    tone="raised"
                    padding="sm"
                    draggable={movable && !busy}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", d.id);
                      setDragging(d);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOverColumn(null);
                    }}
                    className={cn(
                      "flex flex-col gap-3 transition-opacity",
                      movable && "cursor-grab active:cursor-grabbing",
                      busy && "opacity-60",
                      dragging?.id === d.id && "opacity-40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={d.creator.avatarUrl} alt={d.creator.name} fallback={initials(d.creator.name)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{d.creator.name}</p>
                        <p className="truncate text-[13px] text-foreground-muted">{d.campaignTitle}</p>
                      </div>
                      {movable && <GripVertical className="h-4 w-4 shrink-0 text-foreground-subtle" aria-hidden="true" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{formatCurrency(d.agreedPrice)}</span>
                      <span className="text-foreground-muted">
                        {d.dueDate
                          ? `Due ${new Date(`${d.dueDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`
                          : "No due date"}
                      </span>
                    </div>
                    {/* Keyboard / touch alternative to dragging. */}
                    {movable && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" className="flex-1" disabled={busy} onClick={() => move(d, "active")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => move(d, "declined")}>
                          Decline
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </section>
        );
      })}
    </div>
  );
}

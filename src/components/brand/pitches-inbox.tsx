"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GitCompareArrows, Inbox, MapPin, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { updateCollaborationStatusAction } from "@/lib/actions/collaborations";
import type { Pitch } from "@/lib/brand/get-pitches";
import { cn, formatCompactNumber, formatCurrency, initials } from "@/lib/utils";

const MAX_COMPARE = 3;

interface Row {
  label: string;
  render: (p: Pitch) => React.ReactNode;
  /** Numeric value used to mark the best column; omitted for text rows. */
  score?: (p: Pitch) => number | null;
  better?: "higher" | "lower";
}

const perThousand = (p: Pitch) =>
  p.creator.followers > 0 ? (p.applicationPrice / p.creator.followers) * 1000 : null;

const ROWS: Row[] = [
  { label: "Followers", render: (p) => formatCompactNumber(p.creator.followers), score: (p) => p.creator.followers, better: "higher" },
  { label: "Application price", render: (p) => formatCurrency(p.applicationPrice), score: (p) => p.applicationPrice, better: "lower" },
  {
    label: "Cost per 1K followers",
    render: (p) => {
      const v = perThousand(p);
      return v === null ? "—" : formatCurrency(v);
    },
    score: perThousand,
    better: "lower",
  },
  { label: "List price / post", render: (p) => (p.creator.listPrice === null ? "Card not public" : formatCurrency(p.creator.listPrice)) },
  { label: "Location", render: (p) => p.creator.location || "—" },
  {
    label: "Focus areas",
    render: (p) =>
      p.creator.tags.length === 0 ? (
        "—"
      ) : (
        <span className="flex flex-wrap gap-1">
          {p.creator.tags.map((t) => (
            <Badge key={t} variant="accent">
              {t}
            </Badge>
          ))}
        </span>
      ),
  },
  { label: "Campaign", render: (p) => p.campaignTitle },
  { label: "Applied", render: (p) => new Date(p.appliedAt).toLocaleDateString() },
];

function bestIds(pitches: Pitch[], row: Row): Set<string> {
  if (!row.score || !row.better || pitches.length < 2) return new Set();
  const scored = pitches.map((p) => ({ id: p.id, v: row.score!(p) })).filter((x): x is { id: string; v: number } => x.v !== null);
  if (scored.length < 2) return new Set();
  const target = row.better === "higher" ? Math.max(...scored.map((s) => s.v)) : Math.min(...scored.map((s) => s.v));
  const winners = scored.filter((s) => s.v === target);
  // Ties across every column aren't a "best".
  return winners.length === scored.length ? new Set() : new Set(winners.map((w) => w.id));
}

export function PitchesInbox({ pitches }: { pitches: Pitch[] }) {
  const router = useRouter();
  const [picked, setPicked] = React.useState<string[]>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const compared = picked.map((id) => pitches.find((p) => p.id === id)).filter((p): p is Pitch => !!p);

  function toggle(id: string) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id]));
  }

  async function act(id: string, action: "accept" | "decline") {
    setBusyId(id);
    const result = await updateCollaborationStatusAction({ collaborationId: id, action });
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPicked((cur) => cur.filter((x) => x !== id));
    toast.success(action === "accept" ? "Pitch accepted" : "Pitch declined");
    router.refresh();
  }

  if (pitches.length === 0) {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-3 py-16 text-center text-foreground-muted">
        <Inbox className="h-7 w-7 text-foreground-subtle" strokeWidth={1.5} />
        <p className="font-medium text-foreground">No pitches to review</p>
        <p className="max-w-sm text-sm">
          When creators apply to a published campaign, their pitches land here so you can compare them side by side.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {compared.length > 0 && (
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <GitCompareArrows className="h-5 w-5 text-accent" strokeWidth={1.75} />
              Compare
            </CardTitle>
            <span className="text-[13px] text-foreground-muted">
              {compared.length < 2 ? "Pick one more pitch to compare" : "Best value in each row is highlighted"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="w-40 pb-4" />
                  {compared.map((p) => {
                    const busy = busyId === p.id;
                    return (
                      <th key={p.id} className="pb-4 pr-4 text-left align-top font-normal">
                        <div className="flex items-start gap-3">
                          <Avatar src={p.creator.avatarUrl} alt={p.creator.name} fallback={initials(p.creator.name)} className="h-12 w-12" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{p.creator.name}</p>
                            <p className="line-clamp-2 text-[13px] text-foreground-muted">{p.creator.headline}</p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${p.creator.name} from comparison`}
                            onClick={() => toggle(p.id)}
                            className="rounded-md p-1 text-foreground-subtle hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="primary" className="flex-1" disabled={busy} onClick={() => act(p.id, "accept")}>
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => act(p.id, "decline")}>
                            Decline
                          </Button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const best = bestIds(compared, row);
                  return (
                    <tr key={row.label}>
                      <th scope="row" className="border-t border-border py-3 pr-4 text-left text-[13px] font-normal text-foreground-muted">
                        {row.label}
                      </th>
                      {compared.map((p) => (
                        <td key={p.id} className="border-t border-border py-3 pr-4 align-middle">
                          <span
                            className={cn(
                              "inline-block rounded-md px-2 py-0.5 font-medium",
                              best.has(p.id) && "bg-accent-soft text-accent-soft-foreground",
                            )}
                          >
                            {row.render(p)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <section aria-label="Pitches" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {pitches.map((p) => {
          const isPicked = picked.includes(p.id);
          const full = picked.length >= MAX_COMPARE && !isPicked;
          const busy = busyId === p.id;
          return (
            <Card key={p.id} tone="raised" className={cn("flex flex-col gap-4", isPicked && "ring-2 ring-accent")}>
              <div className="flex items-start gap-3">
                <Avatar src={p.creator.avatarUrl} alt={p.creator.name} fallback={initials(p.creator.name)} className="h-14 w-14" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-medium">{p.creator.name}</p>
                  {p.creator.location && (
                    <p className="flex items-center gap-1 text-[13px] text-foreground-muted">
                      <MapPin className="h-3 w-3" strokeWidth={1.75} />
                      {p.creator.location}
                    </p>
                  )}
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-foreground-muted">{p.creator.headline || "No headline yet"}</p>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                <div>
                  <p className="text-[13px] text-foreground-muted">Followers</p>
                  <p className="font-medium">{formatCompactNumber(p.creator.followers)}</p>
                </div>
                <div>
                  <p className="text-[13px] text-foreground-muted">Price</p>
                  <p className="font-medium">{formatCurrency(p.applicationPrice)}</p>
                </div>
              </div>
              <p className="truncate text-[13px] text-foreground-muted">For {p.campaignTitle}</p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" variant={isPicked ? "primary" : "outline"} aria-pressed={isPicked} disabled={full} onClick={() => toggle(p.id)}>
                  {isPicked ? "Comparing" : "Compare"}
                </Button>
                <Button size="sm" variant="primary" disabled={busy} onClick={() => act(p.id, "accept")}>
                  Accept
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => act(p.id, "decline")}>
                  Decline
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
      {picked.length >= MAX_COMPARE && (
        <p className="text-[13px] text-foreground-muted">You can compare up to {MAX_COMPARE} pitches at a time.</p>
      )}
    </div>
  );
}

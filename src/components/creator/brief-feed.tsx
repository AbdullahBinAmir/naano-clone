"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, MessageSquare, Search } from "lucide-react";
import { OpportunityCard } from "@/components/creator/opportunity-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyToCampaignAction } from "@/lib/actions/collaborations";
import { startDirectConversationAction } from "@/lib/actions/messages";
import { cn } from "@/lib/utils";

export interface FeedBrief {
  id: string;
  title: string;
  briefText: string;
  budget: number;
  targetVertical: string;
  brandName: string;
  brandProfileId: string;
  deadline: string | null;
  createdAt: string;
}

type Sort = "newest" | "budget" | "deadline";

const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "budget", label: "Highest budget" },
  { id: "deadline", label: "Closing soonest" },
];

const verticalsOf = (b: FeedBrief) =>
  b.targetVertical
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export function BriefFeed({ briefs, today }: { briefs: FeedBrief[]; today: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<Sort>("newest");
  const [vertical, setVertical] = React.useState("");
  const [applyingId, setApplyingId] = React.useState<string | null>(null);
  const [messagingId, setMessagingId] = React.useState<string | null>(null);

  const verticals = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of briefs) for (const v of verticalsOf(b)) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v]) => v);
  }, [briefs]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = briefs.filter(
      (b) =>
        (!vertical || verticalsOf(b).includes(vertical)) &&
        (!q || `${b.title} ${b.brandName} ${b.briefText} ${b.targetVertical}`.toLowerCase().includes(q)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "budget") return b.budget - a.budget;
      if (sort === "deadline") {
        // Open-ended briefs sort last.
        return (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31");
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [briefs, query, vertical, sort]);

  async function handleApply(b: FeedBrief) {
    setApplyingId(b.id);
    const result = await applyToCampaignAction({ campaignId: b.id });
    setApplyingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Application sent to ${b.brandName}`);
    router.refresh();
  }

  async function handleMessage(b: FeedBrief) {
    setMessagingId(b.id);
    const result = await startDirectConversationAction({ otherProfileId: b.brandProfileId });
    setMessagingId(null);
    if (result.error || !result.conversationId) {
      toast.error(result.error ?? "Couldn't start that conversation.");
      return;
    }
    router.push(`/dashboard/creator/messages?conversation=${result.conversationId}`);
  }

  if (briefs.length === 0) {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-3 py-16 text-center text-foreground-muted">
        <Briefcase className="h-7 w-7 text-foreground-subtle" strokeWidth={1.5} />
        <p className="font-medium text-foreground">No open briefs right now</p>
        <p className="max-w-sm text-sm">New campaigns from brands appear here — or a brand may reach out to you directly.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card padding="sm" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-56 flex-1 items-center gap-2 rounded-md border border-border-strong bg-card-raised px-3 py-2.5">
            <Search className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
            <input
              aria-label="Search briefs"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
              placeholder="Search by title, brand or topic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground-muted">
            Sort
            <select
              className="input w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {verticals.length > 0 && (
          <div role="group" aria-label="Filter by vertical" className="flex flex-wrap gap-2">
            {["", ...verticals].map((v) => (
              <button
                key={v || "all"}
                type="button"
                aria-pressed={vertical === v}
                onClick={() => setVertical(v)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
                  vertical === v ? "bg-accent-soft text-accent-soft-foreground" : "bg-card-raised text-foreground-muted hover:text-foreground",
                )}
              >
                {v || "All"}
              </button>
            ))}
          </div>
        )}
      </Card>

      <p className="text-[13px] text-foreground-muted" aria-live="polite">
        {visible.length} open {visible.length === 1 ? "brief" : "briefs"}
      </p>

      {visible.length === 0 ? (
        <Card padding="lg" className="py-12 text-center text-foreground-muted">
          No briefs match those filters.
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((b) => (
            <OpportunityCard
              key={b.id}
              brandName={b.brandName}
              targetVertical={b.targetVertical}
              title={b.title}
              briefText={b.briefText}
              budget={b.budget}
              deadline={b.deadline}
              today={today}
              actions={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMessage(b)} disabled={messagingId === b.id} aria-label={`Message ${b.brandName}`}>
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleApply(b)} disabled={applyingId === b.id}>
                    {applyingId === b.id ? "Applying…" : "Apply"}
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

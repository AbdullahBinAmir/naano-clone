import Link from "next/link";
import { Handshake } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { buildDots, DotGrid } from "@/components/ui/dot-grid";
import { dealProgress } from "@/lib/brand/deal-progress";
import type { OverviewDeal } from "@/lib/brand/get-brand-overview";
import { formatCurrency, initials } from "@/lib/utils";

function daysLeftLabel(daysLeft: number | null) {
  if (daysLeft === null) return "No due date";
  if (daysLeft < 0) return `${-daysLeft}d overdue`;
  if (daysLeft === 0) return "Due today";
  return `${daysLeft}d left`;
}

export function OngoingDeals({ deals, today, filteredLabel }: { deals: OverviewDeal[]; today: string; filteredLabel?: string }) {
  return (
    <section aria-labelledby="ongoing-title" className="flex flex-col gap-4">
      <CardTitle id="ongoing-title" className="text-2xl">
        Ongoing deals
      </CardTitle>
      {deals.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-center gap-3 py-12 text-center text-foreground-muted">
          <Handshake className="h-7 w-7 text-foreground-subtle" strokeWidth={1.5} />
          <p className="font-medium text-foreground">{filteredLabel ? "No deliverables due that day" : "No active deals yet"}</p>
          <p className="max-w-sm text-sm">
            {filteredLabel ?? "Accept a pitch or invite a creator from Match — active bookings are tracked here."}
          </p>
          {!filteredLabel && (
            <Link href="/dashboard/brand/match" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Find creators
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {deals.map((d) => {
            const progress = dealProgress(d.createdAt, d.dueDate, today);
            const dots = progress.overdue
              ? buildDots({ total: progress.total, highlight: progress.total })
              : buildDots({
                  total: progress.total,
                  accent: progress.filled,
                  ring: progress.filled < progress.total ? 1 : 0,
                });
            return (
              <Card key={d.id} tone="raised" padding="lg" className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={d.creator.avatarUrl} alt={d.creator.name} fallback={initials(d.creator.name)} className="h-14 w-14" />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium">{d.creator.name}</p>
                      <p className="truncate text-sm text-foreground-muted">{d.campaignTitle}</p>
                    </div>
                  </div>
                  <span
                    className={
                      progress.overdue
                        ? "shrink-0 rounded-full bg-highlight px-2.5 py-0.5 text-xs font-medium text-highlight-foreground"
                        : "shrink-0 rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-medium text-foreground"
                    }
                  >
                    {daysLeftLabel(progress.daysLeft)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-foreground-muted">Agreed price</span>
                  <span className="font-medium">{formatCurrency(d.agreedPrice)}</span>
                </div>
                <div>
                  <DotGrid dots={dots} size="sm" label={progress.label} />
                  <p className="mt-2 text-[13px] text-foreground-muted">{progress.label}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

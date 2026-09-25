import { Hourglass } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardTitle } from "@/components/ui/card";
import { CountdownBadge } from "@/components/ui/countdown-badge";
import type { OverviewDeal } from "@/lib/brand/get-brand-overview";
import { formatCurrency, initials } from "@/lib/utils";

/** Offers the brand sent that are still waiting on the creator, with a timer to the due date when there is one. */
export function WaitingList({ deals, filteredLabel }: { deals: OverviewDeal[]; filteredLabel?: string }) {
  return (
    <section aria-labelledby="waiting-title" className="flex flex-col gap-3">
      <CardTitle id="waiting-title" className="text-2xl">
        Waiting on creators
      </CardTitle>
      {deals.length === 0 ? (
        <Card padding="md" className="flex flex-col items-center gap-2 py-8 text-center text-foreground-muted">
          <Hourglass className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
          <p className="font-medium text-foreground">{filteredLabel ? "Nothing due that day" : "No offers waiting"}</p>
          <p className="text-sm">
            {filteredLabel ?? "Direct invites you send from Match wait here until the creator responds."}
          </p>
        </Card>
      ) : (
        deals.map((d) => (
          <Card key={d.id} tone="raised" padding="sm" className="relative flex items-center gap-3">
            <Avatar src={d.creator.avatarUrl} alt={d.creator.name} fallback={initials(d.creator.name)} className="h-12 w-12" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{d.creator.name}</p>
              <p className="truncate text-sm text-foreground-muted">
                {d.campaignTitle} · {formatCurrency(d.agreedPrice)}
              </p>
            </div>
            {d.secondsToDue !== null ? (
              <CountdownBadge seconds={d.secondsToDue} className="absolute -top-2 right-3" />
            ) : (
              <span className="absolute -top-2 right-3 rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
                No due date
              </span>
            )}
          </Card>
        ))
      )}
    </section>
  );
}

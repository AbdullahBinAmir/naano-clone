import * as React from "react";
import { CalendarClock, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { describeDeadline } from "@/lib/deadline";
import { cn, formatCurrency } from "@/lib/utils";

export interface OpportunityCardProps {
  brandName: string;
  targetVertical: string;
  title: string;
  briefText: string;
  budget: number;
  /** Optional apply-by date (YYYY-MM-DD). */
  deadline?: string | null;
  /** Server "today" (YYYY-MM-DD) so the countdown text can't mismatch on hydration. */
  today: string;
  /** Buttons rendered under the budget (Apply / Message on the real feed, inert in previews). */
  actions?: React.ReactNode;
}

/**
 * Job-board row: what it pays and when it closes come first. Shared by the
 * creator's Brief Feed and the brand composer's live preview, so the preview
 * is exactly what creators see.
 */
export function OpportunityCard({
  brandName,
  targetVertical,
  title,
  briefText,
  budget,
  deadline,
  today,
  actions,
}: OpportunityCardProps) {
  const info = describeDeadline(deadline, today);

  return (
    <Card padding="lg" className="flex flex-col gap-5 md:flex-row md:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-card-raised">
            <Store className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{brandName}</p>
            <p className="truncate text-[13px] text-foreground-muted">{targetVertical || "No vertical set"}</p>
          </div>
        </div>
        <h3 className="mt-4 text-xl font-medium">{title || "Untitled brief"}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-foreground-muted">{briefText || "Your brief will appear here."}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-4 border-t border-border pt-5 md:w-56 md:items-end md:border-t-0 md:border-l md:pt-0 md:pl-8">
        <div className="md:text-right">
          <p className="text-[13px] text-foreground-muted">Budget</p>
          <p className="text-4xl font-semibold tracking-tight">{formatCurrency(budget)}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium",
            info.urgency === "soon" && "bg-highlight text-highlight-foreground",
            info.urgency === "expired" && "bg-danger/15 text-danger",
            (info.urgency === "normal" || info.urgency === "none") && "bg-card-raised text-foreground",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {info.label}
          {info.detail && <span className="font-normal opacity-70">· {info.detail}</span>}
        </span>
        {actions}
      </div>
    </Card>
  );
}

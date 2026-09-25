"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePillStrip, type DatePillDay } from "@/components/ui/date-pill-strip";
import { GradientStatCard } from "@/components/ui/gradient-stat-card";
import { OngoingDeals } from "@/components/brand/overview/ongoing-deals";
import { PitchList } from "@/components/brand/overview/pitch-list";
import { StatisticsChart } from "@/components/brand/overview/statistics-chart";
import { WaitingList } from "@/components/brand/overview/waiting-list";
import type { BrandOverviewData } from "@/lib/brand/get-brand-overview";
import { formatCurrency } from "@/lib/utils";

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 14;

function buildDays(today: string, dueDates: Set<string>): DatePillDay[] {
  const start = Date.parse(today);
  return Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const d = new Date(start + i * DAY_MS);
    const id = d.toISOString().slice(0, 10);
    return {
      id,
      day: String(d.getUTCDate()).padStart(2, "0"),
      weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      marked: dueDates.has(id),
    };
  });
}

export function BrandOverview({ companyName, data }: { companyName: string; data: BrandOverviewData }) {
  const [selectedDay, setSelectedDay] = React.useState("");

  const dueDates = React.useMemo(
    () => new Set([...data.active, ...data.waiting].map((d) => d.dueDate).filter((d): d is string => !!d)),
    [data.active, data.waiting],
  );
  const days = React.useMemo(() => buildDays(data.today, dueDates), [data.today, dueDates]);

  const filterByDay = <T extends { dueDate: string | null }>(deals: T[]) =>
    selectedDay ? deals.filter((d) => d.dueDate === selectedDay) : deals;
  const active = filterByDay(data.active);
  const waiting = filterByDay(data.waiting);

  const filteredLabel = selectedDay
    ? `Nothing is due on ${new Date(`${selectedDay}T00:00:00Z`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })}.`
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Brand workspace"
        title={`Good to see you, ${companyName}`}
        description="Pitches to review, deals in flight and how your creators' posts are performing."
        action={
          <Link href="/dashboard/brand/match" className={buttonVariants({ variant: "primary" })}>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Find creators
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card padding="md" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] text-foreground-muted">
                Deliverables due — pick a day to filter ongoing deals and waiting offers
                {dueDates.size === 0 && " (no due dates are set yet)"}
              </p>
              {selectedDay && (
                <button
                  type="button"
                  onClick={() => setSelectedDay("")}
                  className="rounded-md text-[13px] font-medium text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
                >
                  Clear filter
                </button>
              )}
            </div>
            <DatePillStrip
              days={days}
              selectedId={selectedDay}
              onSelect={(id) => setSelectedDay((cur) => (cur === id ? "" : id))}
              ariaLabel="Deliverables due"
            />
          </Card>

          <StatisticsChart posts={data.posts} snapshots={data.snapshots} today={data.today} />
          <OngoingDeals deals={active} today={data.today} filteredLabel={filteredLabel} />
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <PitchList pitches={data.pitches} />
          <WaitingList deals={waiting} filteredLabel={filteredLabel} />
          <GradientStatCard
            value={formatCurrency(data.totalSpend)}
            label={
              data.spendDeals === 0
                ? "Total spend — nothing booked yet"
                : `Total spend across ${data.spendDeals} active or completed ${data.spendDeals === 1 ? "deal" : "deals"}`
            }
            avatars={data.spendCreators.map((c) => ({ name: c.name, src: c.avatarUrl }))}
            avatarTotal={data.spendCreators.length}
          />
        </aside>
      </div>
    </>
  );
}

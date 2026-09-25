"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSeries, type PostPoint, type SeriesRange, type SnapshotPoint } from "@/lib/brand/impressions-series";
import { cn, formatCompactNumber } from "@/lib/utils";

const RANGES: { id: SeriesRange; label: string; previous: string }[] = [
  { id: "days", label: "Days", previous: "previous 14 days" },
  { id: "weeks", label: "Weeks", previous: "previous 8 weeks" },
  { id: "months", label: "Months", previous: "previous 6 months" },
];

export function StatisticsChart({
  posts,
  snapshots,
  today,
}: {
  posts: PostPoint[];
  snapshots: SnapshotPoint[];
  today: string;
}) {
  const [range, setRange] = React.useState<SeriesRange>("months");
  const data = React.useMemo(() => buildSeries(range, posts, snapshots, today), [range, posts, snapshots, today]);
  const hasData = data.some((p) => p.current > 0 || p.previous > 0);
  const active = RANGES.find((r) => r.id === range)!;

  return (
    <Card padding="lg">
      <CardHeader className="mb-2 flex-wrap">
        <div>
          <CardTitle className="text-2xl">Statistics</CardTitle>
          <p className="mt-1 text-[13px] text-foreground-muted">
            Impressions from the creators you&apos;ve booked. Click tracking isn&apos;t available yet.
          </p>
        </div>
        <div role="group" aria-label="Time range" className="flex items-center gap-4">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "rounded-md text-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
                range === r.id ? "text-foreground" : "text-foreground-muted hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>

      {hasData ? (
        <>
          <div className="mb-2 flex items-center gap-5 text-[13px] text-foreground-muted">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 rounded bg-accent" /> This period
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0 w-5 border-t-2 border-dashed border-highlight" /> {active.previous}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="statsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-foreground-subtle)", fontSize: 12 }} />
              <YAxis
                width={44}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-foreground-subtle)", fontSize: 12 }}
                tickFormatter={(v: number) => formatCompactNumber(v)}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                contentStyle={{ background: "#1C1C1F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, fontSize: 12 }}
                labelStyle={{ color: "#fff" }}
                formatter={(value, name) => [
                  formatCompactNumber(Number(value)),
                  name === "current" ? "This period" : "Previous period",
                ]}
              />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="var(--color-highlight)"
                strokeWidth={2}
                strokeDasharray="6 6"
                fill="none"
                dot={false}
              />
              <Area type="monotone" dataKey="current" stroke="var(--color-accent)" strokeWidth={2.5} fill="url(#statsFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-foreground-muted">
          <BarChart3 className="h-7 w-7 text-foreground-subtle" strokeWidth={1.5} />
          <p className="font-medium text-foreground">No performance data for this range</p>
          <p className="max-w-sm text-sm">
            Impressions appear once creators you&apos;ve booked add their post stats.
          </p>
        </div>
      )}
    </Card>
  );
}

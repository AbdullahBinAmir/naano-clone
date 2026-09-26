"use client";

import { CURRENCY } from "@/lib/constants";
import * as React from "react";
import NumberFlow from "@number-flow/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { Card } from "@/components/ui/card";
import { SAMPLE_BRANDS } from "@/lib/marketing/landing-static";
import { cn, formatCompactNumber } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 28, label: "28 days" },
] as const;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// Anchored so the labels never depend on "today" (identical on server and client).
const dayLabel = (index: number, length: number) => {
  const d = new Date(Date.UTC(2026, 8, 28 - (length - 1 - index)));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

export function ResultsShowcase() {
  const [brandId, setBrandId] = React.useState(SAMPLE_BRANDS[0].id);
  const [days, setDays] = React.useState<7 | 14 | 28>(28);
  const brand = SAMPLE_BRANDS.find((b) => b.id === brandId)!;

  const data = React.useMemo(() => {
    const cur = brand.daily.slice(-days);
    const prev = brand.dailyPrevious.slice(-days);
    return cur.map((v, i) => ({ label: dayLabel(i + (28 - days), 28), current: v, previous: prev[i] }));
  }, [brand, days]);

  const impressions = sum(data.map((d) => d.current));
  const previousImpressions = sum(data.map((d) => d.previous));
  const delta = Math.round(((impressions - previousImpressions) / previousImpressions) * 100);
  const clicks = Math.round(impressions * (brand.clickRate / 100));
  const cpm = ((brand.spend * (days / 28)) / impressions) * 1000;

  const kpis = [
    { label: "Impressions", value: impressions, format: { notation: "compact", maximumFractionDigits: 1 } as const },
    { label: "Engagement rate", value: brand.engagementRate / 100, format: { style: "percent", maximumFractionDigits: 1 } as const },
    { label: "Link clicks", value: clicks, format: { notation: "compact", maximumFractionDigits: 1 } as const },
    { label: "Cost per 1K", value: cpm, format: { style: "currency", currency: CURRENCY, maximumFractionDigits: 2 } as const },
  ];

  return (
    <section id="results" className="relative scroll-mt-8 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 0% 0%, rgba(245,197,66,0.22), transparent 65%), linear-gradient(165deg, #6A45C2 0%, #3B1F86 30%, #140B2E 62%, #000 100%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[90rem] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
      <Reveal className="max-w-3xl">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">Results</p>
        <h2 className="mt-5 text-[clamp(2.1rem,4.4vw,3.75rem)] leading-[1.07] font-medium tracking-[-0.01em]">
          <span className="block text-[#1A1A1A]">Know exactly what</span>
          <span className="block text-white">every post delivered.</span>
        </h2>
        <p className="mt-5 max-w-xl text-white/75">
          Reach, engagement and cost roll up per campaign. Switch brands and ranges to see what a Naano report looks like.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-12">
        <div className="grid gap-4 lg:grid-cols-[17rem_1fr]">
          {/* brand picker */}
          <div
            role="tablist"
            aria-label="Sample campaigns"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible"
          >
            {SAMPLE_BRANDS.map((b) => {
              const selected = b.id === brandId;
              return (
                <button
                  key={b.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setBrandId(b.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none lg:w-full",
                    selected ? "border-accent bg-card-raised shadow-[0_0_28px_rgba(155,92,246,0.35)]" : "border-white/10 bg-card hover:bg-card-raised",
                  )}
                >
                  <span className="min-w-0">
                    <span className={cn("block truncate text-2xl text-foreground", b.wordmark)}>{b.name}</span>
                    <span className="hidden truncate text-xs text-foreground-muted lg:block">{b.category}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* report */}
          <Card padding="lg" role="tabpanel" aria-label={`${brand.name} campaign report`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground-muted">{brand.category}</p>
                <h3 className="mt-1 text-2xl font-medium tracking-tight">{brand.campaign}</h3>
                <p className="mt-1 text-[13px] text-foreground-muted">
                  {brand.creators} creators · {brand.posts} posts
                </p>
              </div>
              <div role="group" aria-label="Date range" className="flex rounded-md bg-card-raised p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.days}
                    type="button"
                    aria-pressed={days === r.days}
                    onClick={() => setDays(r.days)}
                    className={cn(
                      "rounded-[0.6rem] px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
                      days === r.days ? "bg-accent text-white" : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {kpis.map((k, i) => (
                <div key={k.label} className="rounded-md border border-border bg-card-raised p-4">
                  <p className="text-[13px] text-foreground-muted">{k.label}</p>
                  <p className="mt-1.5 text-3xl font-semibold tracking-tight">
                    <NumberFlow value={k.value} format={k.format} />
                  </p>
                  {i === 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                      <NumberFlow value={delta} suffix="% vs previous" />
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 mb-2 flex items-center gap-5 text-[13px] text-foreground-muted">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-5 rounded bg-accent" /> This period
              </span>
              <span className="flex items-center gap-2">
                <span className="h-0 w-5 border-t-2 border-dashed border-highlight" /> Previous {days} days
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={`${brandId}-${days}`} data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="landingFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                    tick={{ fill: "var(--color-foreground-subtle)", fontSize: 12 }}
                  />
                  <YAxis
                    width={44}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-foreground-subtle)", fontSize: 12 }}
                    tickFormatter={(v: number) => formatCompactNumber(v)}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.14)" }}
                    contentStyle={{ background: "#1C1C1F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, fontSize: 12 }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value, name) => [
                      formatCompactNumber(Number(value)),
                      name === "current" ? "This period" : "Previous period",
                    ]}
                  />
                  <Area type="monotone" dataKey="previous" stroke="var(--color-highlight)" strokeWidth={2} strokeDasharray="6 6" fill="none" dot={false} />
                  <Area type="monotone" dataKey="current" stroke="var(--color-accent)" strokeWidth={2.5} fill="url(#landingFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-foreground-subtle">
              Sample data for illustration — fictional brands and figures, shown to demonstrate Naano&apos;s reporting.
            </p>
          </Card>
        </div>
      </Reveal>
      </div>
    </section>
  );
}

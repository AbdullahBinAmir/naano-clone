"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyEarnings } from "@/types/domain";

export function EarningsChart({ data }: { data: MonthlyEarnings[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-foreground-subtle)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "rgba(20,20,24,0.9)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-foreground)" }}
          formatter={(value) => [formatCurrency(Number(value)), "Earned"]}
        />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="var(--color-accent)" maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

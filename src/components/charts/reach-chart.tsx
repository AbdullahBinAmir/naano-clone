"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCompactNumber } from "@/lib/utils";

export function ReachChart({ data }: { data: { date: string; reach: number; engagements: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-foreground-subtle)", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(20,20,24,0.9)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-foreground)" }}
          formatter={(value, name) => [formatCompactNumber(Number(value)), name === "reach" ? "Reach" : "Engagements"]}
        />
        <Area
          type="monotone"
          dataKey="reach"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#reachFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

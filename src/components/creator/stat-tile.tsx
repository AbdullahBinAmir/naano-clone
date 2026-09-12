import * as React from "react";
import NumberFlow, { type Format } from "@number-flow/react";
import { GlassCard } from "@/components/glass/glass-card";
import { cn } from "@/lib/utils";

export function StatTile({
  icon,
  label,
  value,
  format,
  prefix,
  suffix,
  caption,
  pending,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number | null;
  format?: Format;
  prefix?: string;
  suffix?: string;
  caption: string;
  pending?: boolean;
  className?: string;
}) {
  return (
    <GlassCard className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground-subtle uppercase">
        <span className="text-foreground-muted">{icon}</span>
        {label}
      </div>
      <div className="text-3xl font-semibold tabular-nums">
        {pending || value === null || value === undefined ? (
          <span className="text-foreground-subtle">{pending ? "Pending" : "—"}</span>
        ) : (
          <NumberFlow value={value} format={format} prefix={prefix} suffix={suffix} />
        )}
      </div>
      <p className="text-sm text-foreground-muted">{caption}</p>
    </GlassCard>
  );
}

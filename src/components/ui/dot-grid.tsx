import { cn } from "@/lib/utils";

export type DotState = "accent" | "highlight" | "ring" | "empty";

export interface DotGridProps {
  dots: DotState[];
  size?: "sm" | "md";
  /** Accessible summary; defaults to a count of each state. */
  label?: string;
  className?: string;
}

const DOT_CLASS: Record<DotState, string> = {
  accent: "bg-accent",
  highlight: "bg-highlight",
  ring: "border-2 border-highlight bg-transparent",
  empty: "bg-surface-3",
};

/** Builds a dot sequence: `accent` purple, `highlight` yellow, `ring` hollow yellow, rest empty. */
export function buildDots({
  total,
  accent = 0,
  highlight = 0,
  ring = 0,
}: {
  total: number;
  accent?: number;
  highlight?: number;
  ring?: number;
}): DotState[] {
  const out: DotState[] = [];
  for (let i = 0; i < total; i++) {
    if (i < accent) out.push("accent");
    else if (i < accent + highlight) out.push("highlight");
    else if (i < accent + highlight + ring) out.push("ring");
    else out.push("empty");
  }
  return out;
}

/** Wrapping grid of small dots showing progress or activity. */
export function DotGrid({ dots, size = "md", label, className }: DotGridProps) {
  const counts = dots.reduce<Record<DotState, number>>(
    (acc, d) => ({ ...acc, [d]: acc[d] + 1 }),
    { accent: 0, highlight: 0, ring: 0, empty: 0 },
  );
  const summary =
    label ?? `${counts.accent + counts.highlight + counts.ring} of ${dots.length} active`;
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";

  return (
    <div role="img" aria-label={summary} className={cn("flex flex-wrap gap-1.5", className)}>
      {dots.map((state, i) => (
        <span key={i} aria-hidden="true" className={cn("shrink-0 rounded-full", dotSize, DOT_CLASS[state])} />
      ))}
    </div>
  );
}

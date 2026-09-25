"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DatePillDay {
  id: string;
  /** Big number, e.g. "01". */
  day: string | number;
  /** Small label under it, e.g. "Sat". */
  weekday: string;
  disabled?: boolean;
  /** Small dot under the tile, e.g. "something is due this day". */
  marked?: boolean;
}

export interface DatePillStripProps {
  days: DatePillDay[];
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

/** Row of rounded day tiles; the selected one is filled with the soft accent. */
export function DatePillStrip({ days, selectedId, onSelect, ariaLabel = "Select a day", className }: DatePillStripProps) {
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  // With no selection the strip must still be reachable by keyboard.
  const focusId = days.some((d) => d.id === selectedId) ? selectedId : days.find((d) => !d.disabled)?.id;

  React.useEffect(() => {
    refs.current[selectedId]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  function move(from: string, delta: 1 | -1) {
    const enabled = days.filter((d) => !d.disabled);
    const index = enabled.findIndex((d) => d.id === from);
    const next = enabled[index + delta];
    if (!next) return;
    onSelect(next.id);
    refs.current[next.id]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(id, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(id, -1);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
    >
      {days.map((d) => {
        const selected = d.id === selectedId;
        return (
          <button
            key={d.id}
            ref={(el) => {
              refs.current[d.id] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={d.disabled}
            tabIndex={d.id === focusId ? 0 : -1}
            onClick={() => onSelect(d.id)}
            onKeyDown={(e) => handleKeyDown(e, d.id)}
            className={cn(
              "relative flex h-20 min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none disabled:opacity-40",
              selected
                ? "border-transparent bg-accent-soft text-accent-soft-foreground"
                : "bg-card-raised text-foreground hover:bg-surface-3",
            )}
          >
            <span className="text-xl leading-none font-medium tabular-nums">{d.day}</span>
            <span className={cn("text-sm leading-none", selected ? "text-accent-soft-foreground/70" : "text-foreground-muted")}>
              {d.weekday}
            </span>
            {d.marked && (
              <span
                aria-label="Has deliverables due"
                className={cn("absolute bottom-2 h-1.5 w-1.5 rounded-full", selected ? "bg-accent" : "bg-highlight")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

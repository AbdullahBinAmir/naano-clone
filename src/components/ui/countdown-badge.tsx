"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** 75 -> "01:15"; 3725 -> "1:02:05"; 3 days out -> "3d 4h". NaN renders as "--:--". */
export function formatCountdown(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds)) return "--:--";
  const s = Math.max(0, Math.floor(totalSeconds));
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d}d ${Math.floor((s % 86400) / 3600)}h`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export interface CountdownBadgeProps {
  /** Seconds remaining at first render; ticks down on the client. */
  seconds?: number;
  /** Absolute deadline instead of `seconds` (ms epoch, ISO string or Date). */
  endsAt?: number | string | Date;
  paused?: boolean;
  onComplete?: () => void;
  className?: string;
}

interface Clock {
  key: string;
  start: number;
  now: number;
}

/** Small yellow pill showing a ticking "00:17"-style countdown. */
export function CountdownBadge({ seconds, endsAt, paused, onComplete, className }: CountdownBadgeProps) {
  const endMs = endsAt === undefined ? undefined : new Date(endsAt).getTime();
  const key = `${seconds ?? ""}|${endMs ?? ""}`;
  const [clock, setClock] = React.useState<Clock | null>(null);
  const completeRef = React.useRef(onComplete);

  React.useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const remainingAt = (now: number) =>
      endMs !== undefined ? (endMs - now) / 1000 : (seconds ?? 0) - (now - start) / 1000;

    const id = setInterval(() => {
      const now = Date.now();
      setClock({ key, start, now });
      if (remainingAt(now) <= 0) {
        clearInterval(id);
        completeRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [paused, key, endMs, seconds]);

  let remaining: number;
  if (clock && clock.key === key) {
    remaining = endMs !== undefined ? (endMs - clock.now) / 1000 : (seconds ?? 0) - (clock.now - clock.start) / 1000;
  } else {
    remaining = endMs !== undefined ? Number.NaN : (seconds ?? 0);
  }

  return (
    <span
      role="timer"
      className={cn(
        "inline-flex items-center rounded-full bg-highlight px-2.5 py-0.5 text-xs font-medium tabular-nums text-highlight-foreground",
        className,
      )}
      suppressHydrationWarning
    >
      {formatCountdown(remaining)}
    </span>
  );
}

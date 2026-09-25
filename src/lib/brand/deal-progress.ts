const DAY_MS = 86_400_000;

/** Whole days from `from` to `to` (both "YYYY-MM-DD" or ISO strings, compared as UTC dates). */
export function daysBetween(from: string, to: string) {
  const a = Date.parse(from.slice(0, 10));
  const b = Date.parse(to.slice(0, 10));
  return Math.round((b - a) / DAY_MS);
}

export interface DealProgress {
  /** Dots to draw. */
  total: number;
  filled: number;
  overdue: boolean;
  /** Days until the deliverable is due; null when no due date is set. */
  daysLeft: number | null;
  label: string;
}

const MAX_DOTS = 42;

/**
 * Progress by day. With a due date: the span from the deal's creation to the
 * due date, filled up to today (scaled down if the span is very long). Without
 * one there's no honest total, so it only counts days elapsed since creation.
 */
export function dealProgress(createdAt: string, dueDate: string | null, today: string): DealProgress {
  const elapsed = Math.max(0, daysBetween(createdAt, today));

  if (!dueDate) {
    const filled = Math.min(Math.max(elapsed, 1), 30);
    return { total: filled, filled, overdue: false, daysLeft: null, label: `${elapsed} days in, no due date set` };
  }

  const span = Math.max(1, daysBetween(createdAt, dueDate));
  const daysLeft = daysBetween(today, dueDate);
  const scale = span > MAX_DOTS ? MAX_DOTS / span : 1;
  const total = Math.max(1, Math.round(span * scale));
  const filled = Math.min(total, Math.round(Math.min(elapsed, span) * scale));
  return { total, filled, overdue: daysLeft < 0, daysLeft, label: `Day ${Math.min(elapsed, span)} of ${span}` };
}

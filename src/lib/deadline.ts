const DAY_MS = 86_400_000;

export interface DeadlineInfo {
  /** Short label, e.g. "Apply by Oct 12" or "Open-ended". */
  label: string;
  /** Secondary text, e.g. "16 days left". */
  detail: string | null;
  urgency: "none" | "normal" | "soon" | "expired";
}

/** Formats a campaign's optional apply-by date against a server-provided "today" (YYYY-MM-DD). */
export function describeDeadline(deadline: string | null | undefined, today: string): DeadlineInfo {
  if (!deadline) return { label: "Open-ended", detail: null, urgency: "none" };
  const days = Math.round((Date.parse(deadline) - Date.parse(today)) / DAY_MS);
  const date = new Date(`${deadline}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  if (days < 0) return { label: `Closed ${date}`, detail: null, urgency: "expired" };
  if (days === 0) return { label: `Apply by ${date}`, detail: "Last day", urgency: "soon" };
  return { label: `Apply by ${date}`, detail: `${days} ${days === 1 ? "day" : "days"} left`, urgency: days <= 3 ? "soon" : "normal" };
}

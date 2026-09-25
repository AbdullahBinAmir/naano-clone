/** Accepts only same-site relative paths, so a `?next=` value can't be used as an open redirect. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

/**
 * Public origin of the deployed site, for absolute URLs in metadata, the
 * sitemap and robots.txt. Prefers an explicit NEXT_PUBLIC_SITE_URL, then
 * Vercel's production hostname, then localhost.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

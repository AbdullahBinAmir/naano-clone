import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site-url";
import type { Database } from "@/types/database";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const staticPages: MetadataRoute.Sitemap = ["", "/pricing", "/sign-up", "/sign-in", "/terms", "/privacy"].map((path) => ({
    url: `${site}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  // Public creator cards, read with the anon key: only what RLS exposes to a visitor.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await supabase.from("marketplace_creators").select("handle").limit(1000);

  return [
    ...staticPages,
    ...(data ?? []).map((c) => ({ url: `${site}/creators/${c.handle}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}

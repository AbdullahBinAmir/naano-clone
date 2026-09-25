import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getBrandOverview } from "@/lib/brand/get-brand-overview";
import { BrandOverview } from "@/components/brand/overview/brand-overview";

export default async function BrandOverviewPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const [{ data: brandRow }, data] = await Promise.all([
    supabase.from("brand_profiles").select("company_name").eq("profile_id", user.id).maybeSingle(),
    getBrandOverview(supabase, user.id),
  ]);
  if (!brandRow) notFound();

  return <BrandOverview companyName={brandRow.company_name} data={data} />;
}

import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getEarningsSummaryForCreator } from "@/lib/earnings/get-earnings-summary";
import { EarningsDashboard } from "@/components/creator/earnings-dashboard";

export default async function EarningsPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();
  const summary = await getEarningsSummaryForCreator(supabase, user.id);

  return <EarningsDashboard {...summary} />;
}

import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateReferralLinks } from "@/lib/affiliate/get-or-create-referral-links";
import { AffiliateDashboard } from "@/components/creator/affiliate-dashboard";

export default async function AffiliateProgramPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();
  const { inviteBrand, inviteCreator } = await getOrCreateReferralLinks(supabase, user.id);

  return <AffiliateDashboard inviteBrand={inviteBrand} inviteCreator={inviteCreator} />;
}

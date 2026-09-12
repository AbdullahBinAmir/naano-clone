import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCreatorCard, rowToCreatorProfile } from "@/lib/mappers/creator";
import { CommunityDashboard } from "@/components/creator/community-dashboard";

export default async function CommunityPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();

  const [{ data: profileRow }, { data: cardRow }, { data: snapshot }] = await Promise.all([
    supabase.from("creator_profiles").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("creator_cards").select("*").eq("creator_profile_id", user.id).maybeSingle(),
    supabase
      .from("linkedin_analytics_snapshots")
      .select("public_post_reach")
      .eq("creator_profile_id", user.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profileRow || !cardRow) notFound();

  return (
    <CommunityDashboard
      profile={rowToCreatorProfile(profileRow)}
      card={rowToCreatorCard(cardRow)}
      publicPostReach={snapshot?.public_post_reach ?? null}
    />
  );
}

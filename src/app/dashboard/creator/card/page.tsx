import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCreatorCard, rowToCreatorProfile } from "@/lib/mappers/creator";
import { MyCardForm } from "@/components/creator/my-card-form";

export default async function MyCardPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();

  const [{ data: profileRow }, { data: cardRow }] = await Promise.all([
    supabase.from("creator_profiles").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("creator_cards").select("*").eq("creator_profile_id", user.id).maybeSingle(),
  ]);

  if (!profileRow || !cardRow) notFound();

  return (
    <MyCardForm
      key={cardRow.id}
      profile={rowToCreatorProfile(profileRow)}
      card={rowToCreatorCard(cardRow)}
    />
  );
}

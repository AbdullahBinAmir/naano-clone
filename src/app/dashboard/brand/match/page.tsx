import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { MatchGrid } from "@/components/brand/match-grid";
import type { CreatorCardRow, CreatorProfileRow } from "@/types/database";

export default async function MatchPage() {
  await requireProfile("brand");
  const supabase = await createClient();

  const { data: creators } = await supabase.from("marketplace_creators").select("*");
  const profileIds = (creators ?? []).map((c) => c.profile_id);

  const { data: cards } =
    profileIds.length > 0
      ? await supabase.from("creator_cards").select("*").in("creator_profile_id", profileIds)
      : { data: [] };
  const cardByProfileId = new Map(((cards ?? []) as CreatorCardRow[]).map((c) => [c.creator_profile_id, c]));

  const matchingCreators = ((creators ?? []) as CreatorProfileRow[])
    .map((profile) => {
      const card = cardByProfileId.get(profile.profile_id);
      if (!card) return null;
      return {
        profileId: profile.profile_id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        headline: profile.headline,
        location: profile.location,
        categoryTags: profile.category_tags,
        pricePerPost: card.price_per_post,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return <MatchGrid creators={matchingCreators} />;
}

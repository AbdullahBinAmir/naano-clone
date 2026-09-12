"use server";

import { createClient } from "@/lib/supabase/server";
import { updateCreatorCardSchema } from "@/lib/validations/creator-card";

export interface CreatorCardActionResult {
  error?: string;
}

export async function updateCreatorCardAction(input: unknown): Promise<CreatorCardActionResult> {
  const parsed = updateCreatorCardSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error: profileError } = await supabase
    .from("creator_profiles")
    .update({
      display_name: parsed.data.displayName,
      headline: parsed.data.headline,
      bio: parsed.data.bio,
      location: parsed.data.location,
      category_tags: parsed.data.categoryTags,
    })
    .eq("profile_id", user.id);
  if (profileError) return { error: profileError.message };

  const { error: cardError } = await supabase
    .from("creator_cards")
    .update({ price_per_post: parsed.data.pricePerPost })
    .eq("creator_profile_id", user.id);
  if (cardError) return { error: cardError.message };

  return {};
}

export async function togglePublishCardAction(publish: boolean): Promise<CreatorCardActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error } = await supabase
    .from("creator_cards")
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq("creator_profile_id", user.id);
  if (error) return { error: error.message };

  return {};
}

/**
 * Logs a view of a public creator card — the data trail the affiliate
 * "deal link" mechanic builds on. Best-effort: failures are swallowed since
 * a visit counter should never break the page for a visitor.
 */
export async function logCardVisitAction(creatorCardId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("card_visits").insert({ creator_card_id: creatorCardId });
  } catch {
    // best-effort only
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_IMAGES_BUCKET } from "@/lib/constants";

export type ImageKind = "avatar" | "banner" | "logo";

export interface ImageActionResult {
  error?: string;
}

/**
 * Stores (or clears, with url = null) the URL of an already-uploaded image on
 * the caller's own profile. The URL must point into the caller's own folder of
 * our storage bucket — otherwise the column could be pointed at any external
 * address.
 */
export async function setProfileImageAction(input: { kind: ImageKind; url: string | null }): Promise<ImageActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  if (input.url !== null) {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PROFILE_IMAGES_BUCKET}/${user.id}/`;
    if (!input.url.startsWith(prefix)) return { error: "That image isn't from your uploads." };
  }
  const value = input.url ?? "";

  const { error } =
    input.kind === "avatar"
      ? await supabase.from("creator_profiles").update({ avatar_url: value }).eq("profile_id", user.id)
      : input.kind === "banner"
        ? await supabase.from("creator_cards").update({ banner_url: value }).eq("creator_profile_id", user.id)
        : await supabase.from("brand_profiles").update({ logo_url: value }).eq("profile_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  revalidatePath("/");
  return {};
}

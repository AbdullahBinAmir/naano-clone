"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { brandSettingsSchema, creatorSettingsSchema } from "@/lib/validations/settings";

export interface SettingsActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsOf(issues: { path: PropertyKey[]; message: string }[]): SettingsActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: issues[0]?.message ?? "Invalid input", fieldErrors };
}

export async function updateCreatorSettingsAction(input: unknown): Promise<SettingsActionResult> {
  const parsed = creatorSettingsSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error.issues);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error } = await supabase
    .from("creator_profiles")
    .update({ display_name: parsed.data.displayName, linkedin_public_url: parsed.data.linkedinPublicUrl })
    .eq("profile_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function updateBrandSettingsAction(input: unknown): Promise<SettingsActionResult> {
  const parsed = brandSettingsSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error.issues);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error } = await supabase
    .from("brand_profiles")
    .update({ company_name: parsed.data.companyName, industry: parsed.data.industry })
    .eq("profile_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

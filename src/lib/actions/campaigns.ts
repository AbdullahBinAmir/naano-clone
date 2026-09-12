"use server";

import { createClient } from "@/lib/supabase/server";
import { campaignStatusSchema, createCampaignSchema } from "@/lib/validations/campaigns";

export interface CampaignActionResult {
  error?: string;
}

export async function createCampaignAction(input: unknown): Promise<CampaignActionResult> {
  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error } = await supabase.from("campaigns").insert({
    brand_profile_id: user.id,
    title: parsed.data.title,
    brief_text: parsed.data.briefText,
    budget: parsed.data.budget,
    target_vertical: parsed.data.targetVertical,
    status: "draft",
  });
  if (error) return { error: error.message };

  return {};
}

export async function updateCampaignStatusAction(input: unknown): Promise<CampaignActionResult> {
  const parsed = campaignStatusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { error } = await supabase
    .from("campaigns")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.campaignId)
    .eq("brand_profile_id", user.id);
  if (error) return { error: error.message };

  return {};
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { campaignIdSchema, campaignStatusSchema, createCampaignSchema, updateCampaignSchema } from "@/lib/validations/campaigns";

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

  if (parsed.data.deadline && parsed.data.deadline < new Date().toISOString().slice(0, 10)) {
    return { error: "The apply-by date can't be in the past." };
  }

  const { error } = await supabase.from("campaigns").insert({
    brand_profile_id: user.id,
    title: parsed.data.title,
    brief_text: parsed.data.briefText,
    budget: parsed.data.budget,
    target_vertical: parsed.data.targetVertical,
    status: "draft",
    // Only sent when set, so a project without the deadline column still works.
    ...(parsed.data.deadline ? { deadline: parsed.data.deadline } : {}),
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

export async function updateCampaignAction(input: unknown): Promise<CampaignActionResult> {
  const parsed = updateCampaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { data: existing } = await supabase
    .from("campaigns")
    .select("id, deadline")
    .eq("id", parsed.data.campaignId)
    .eq("brand_profile_id", user.id)
    .maybeSingle();
  if (!existing) return { error: "Brief not found." };

  // Only a newly chosen date has to be in the future; keeping an old one is fine.
  if (
    parsed.data.deadline &&
    parsed.data.deadline !== existing.deadline &&
    parsed.data.deadline < new Date().toISOString().slice(0, 10)
  ) {
    return { error: "The apply-by date can't be in the past." };
  }

  const { error } = await supabase
    .from("campaigns")
    .update({
      title: parsed.data.title,
      brief_text: parsed.data.briefText,
      budget: parsed.data.budget,
      target_vertical: parsed.data.targetVertical,
      // Only touched when set or explicitly cleared, so it also works before the deadline column exists.
      ...(parsed.data.deadline ? { deadline: parsed.data.deadline } : parsed.data.clearDeadline ? { deadline: null } : {}),
    })
    .eq("id", parsed.data.campaignId)
    .eq("brand_profile_id", user.id);
  if (error) return { error: error.message };

  return {};
}

export async function deleteCampaignAction(input: { campaignId: string }): Promise<CampaignActionResult> {
  const parsed = campaignIdSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid brief." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  // RLS only allows deleting one's own brief while it has no collaborations;
  // an empty result therefore means either it's gone already or it has applicants.
  const { data, error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", parsed.data.campaignId)
    .eq("brand_profile_id", user.id)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Couldn't delete this brief — it may have applicants or offers (close it instead), or migration 0018 isn't applied yet." };
  }
  return {};
}

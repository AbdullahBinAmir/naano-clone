"use server";

import { createClient } from "@/lib/supabase/server";
import {
  applyToCampaignSchema,
  collaborationActionSchema,
  inviteCreatorSchema,
} from "@/lib/validations/collaborations";
import { seedCollaborationConversation } from "@/lib/actions/conversation-helpers";
import { recordCollaborationPayout } from "@/lib/actions/earnings-helpers";

export interface CollaborationActionResult {
  error?: string;
}

// Postgres unique_violation. The DB-level constraints in
// 0004_collaboration_uniqueness.sql are the real defense against duplicate
// applications/invites; the SELECT-before-INSERT checks below are just a
// friendlier fast path that can still lose a race under concurrent
// requests, so every insert here also handles this code explicitly.
const UNIQUE_VIOLATION = "23505";

export async function applyToCampaignAction(input: unknown): Promise<CollaborationActionResult> {
  const parsed = applyToCampaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, title, budget, brand_profile_id, status")
    .eq("id", parsed.data.campaignId)
    .maybeSingle();
  if (campaignError) return { error: campaignError.message };
  if (!campaign || campaign.status !== "published") return { error: "This campaign isn't open for applications." };

  const { data: existing } = await supabase
    .from("collaborations")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("creator_profile_id", user.id)
    .maybeSingle();
  if (existing) return { error: "You've already applied to this campaign." };

  const { data: brand } = await supabase
    .from("brand_profiles")
    .select("company_name, logo_url")
    .eq("profile_id", campaign.brand_profile_id)
    .maybeSingle();

  const { data: inserted, error } = await supabase
    .from("collaborations")
    .insert({
      campaign_id: campaign.id,
      campaign_title: campaign.title,
      creator_profile_id: user.id,
      brand_profile_id: campaign.brand_profile_id,
      brand_name: brand?.company_name ?? "Brand",
      brand_logo_url: brand?.logo_url ?? "",
      status: "applied",
      agreed_price: campaign.budget,
      net_payout_to_creator: campaign.budget,
      next_action_text: "Waiting on brand review",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { error: "You've already applied to this campaign." };
    return { error: error.message };
  }

  await seedCollaborationConversation(supabase, {
    collaborationId: inserted.id,
    creatorProfileId: user.id,
    brandProfileId: campaign.brand_profile_id,
  });

  return {};
}

export async function inviteCreatorAction(input: unknown): Promise<CollaborationActionResult> {
  const parsed = inviteCreatorSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { data: brand } = await supabase
    .from("brand_profiles")
    .select("company_name, logo_url")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!brand) return { error: "Set up your brand profile first." };

  const { data: existing } = await supabase
    .from("collaborations")
    .select("id")
    .is("campaign_id", null)
    .eq("creator_profile_id", parsed.data.creatorProfileId)
    .eq("brand_profile_id", user.id)
    .maybeSingle();
  if (existing) return { error: "You've already invited this creator directly." };

  const { data: inserted, error } = await supabase
    .from("collaborations")
    .insert({
      campaign_id: null,
      campaign_title: "Direct outreach",
      creator_profile_id: parsed.data.creatorProfileId,
      brand_profile_id: user.id,
      brand_name: brand.company_name,
      brand_logo_url: brand.logo_url,
      status: "needs_action",
      agreed_price: parsed.data.agreedPrice,
      net_payout_to_creator: parsed.data.agreedPrice,
      next_action_text: "Review the offer and confirm the post date",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { error: "You've already invited this creator directly." };
    return { error: error.message };
  }

  await seedCollaborationConversation(supabase, {
    collaborationId: inserted.id,
    creatorProfileId: parsed.data.creatorProfileId,
    brandProfileId: user.id,
  });

  return {};
}

export async function updateCollaborationStatusAction(input: unknown): Promise<CollaborationActionResult> {
  const parsed = collaborationActionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { data: collab, error: fetchError } = await supabase
    .from("collaborations")
    .select("id, status, creator_profile_id, brand_profile_id")
    .eq("id", parsed.data.collaborationId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!collab) return { error: "Collaboration not found." };

  const isCreator = collab.creator_profile_id === user.id;
  const isBrand = collab.brand_profile_id === user.id;
  if (!isCreator && !isBrand) return { error: "You're not part of this collaboration." };

  let nextStatus: "active" | "declined" | "completed";
  let nextActionText: string;

  if (parsed.data.action === "accept") {
    if (collab.status === "applied" && isBrand) {
      nextStatus = "active";
      nextActionText = "Publish your post";
    } else if (collab.status === "needs_action" && isCreator) {
      nextStatus = "active";
      nextActionText = "Publish your post";
    } else {
      return { error: "This collaboration can't be accepted right now." };
    }
  } else if (parsed.data.action === "decline") {
    if (collab.status === "applied" && isBrand) {
      nextStatus = "declined";
      nextActionText = "Declined by brand";
    } else if (collab.status === "needs_action" && isCreator) {
      nextStatus = "declined";
      nextActionText = "Declined by creator";
    } else {
      return { error: "This collaboration can't be declined right now." };
    }
  } else {
    if (collab.status === "active" && isCreator) {
      nextStatus = "completed";
      nextActionText = "Marked as posted";
    } else {
      return { error: "Only the creator can mark an active collaboration as posted." };
    }
  }

  const { error } = await supabase
    .from("collaborations")
    .update({ status: nextStatus, next_action_text: nextActionText })
    .eq("id", collab.id);
  if (error) return { error: error.message };

  if (nextStatus === "completed") {
    await recordCollaborationPayout(supabase, collab.id);
  }

  return {};
}

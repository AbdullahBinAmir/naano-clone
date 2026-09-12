"use server";

import { createClient } from "@/lib/supabase/server";
import {
  applyToCampaignSchema,
  collaborationActionSchema,
  inviteCreatorSchema,
} from "@/lib/validations/collaborations";
import { seedCollaborationConversation } from "@/lib/actions/conversation-helpers";
import { recordCollaborationPayout } from "@/lib/actions/earnings-helpers";
import { activateReferralsForCompletedCollaboration } from "@/lib/actions/affiliate-helpers";

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

  // The state machine itself now lives entirely in the
  // update_collaboration_status RPC (see
  // supabase/migrations/0011_collaboration_write_integrity.sql) — there is
  // no direct client UPDATE path on collaborations at all any more, since
  // one existed only to be reachable via a raw REST call bypassing this
  // action's checks entirely (forge status straight to 'completed', mint a
  // fabricated payout).
  const { error } = await supabase.rpc("update_collaboration_status", {
    p_collaboration_id: parsed.data.collaborationId,
    p_action: parsed.data.action,
  });
  if (error) return { error: error.message };

  if (parsed.data.action === "complete") {
    await recordCollaborationPayout(supabase, parsed.data.collaborationId);
    await activateReferralsForCompletedCollaboration(supabase, parsed.data.collaborationId);
  }

  return {};
}

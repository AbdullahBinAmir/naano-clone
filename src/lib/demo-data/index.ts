import {
  MARKETPLACE_FOLLOWER_THRESHOLD,
  creatorCards,
  creatorProfiles,
  isMarketplaceUnlocked,
  launchGuideSteps,
} from "./creators";
import { brandProfiles, campaigns } from "./brands";
import { collaborationsByCreator } from "./collaborations";
import { earningsByCreator, monthlyEarningsByCreator, payoutMethodsByCreator, totals } from "./earnings";
import { conversationsByCreator, messagesByConversation } from "./messages";
import { affiliateReferralsByCreator } from "./affiliate";
import { analyticsByCreator, linkedinPostsByCreator } from "./analytics";
import { getDemoOpportunitiesSync } from "./opportunities";

export type CreatorHandleKey = "alexis" | "marcus" | "juliette";
export const DEFAULT_CREATOR: CreatorHandleKey = "alexis";
export const CREATOR_PERSONA_KEYS: CreatorHandleKey[] = ["alexis", "marcus", "juliette"];

export type BrandHandleKey = "ferngrove" | "bramble" | "northloop";
export const DEFAULT_BRAND: BrandHandleKey = "ferngrove";

// --- Creator accessors -----------------------------------------------------
// Shaped like their future Supabase equivalents, e.g.
// `getCreatorByHandle(supabase, handle)`, so swapping the data source later
// is a one-line change per call site.

export async function getDemoCreator(key: CreatorHandleKey) {
  const profile = creatorProfiles[key];
  const card = creatorCards[key];
  return { profile, card, launchGuide: launchGuideSteps(key) };
}

export async function getDemoCreatorByHandle(handle: string) {
  const key = (Object.keys(creatorProfiles) as CreatorHandleKey[]).find(
    (k) => creatorProfiles[k].handle === handle,
  );
  if (!key) return null;
  return getDemoCreator(key);
}

export async function getDemoCollaborations(key: CreatorHandleKey) {
  return collaborationsByCreator[key] ?? [];
}

export async function getDemoEarnings(key: CreatorHandleKey) {
  return {
    entries: earningsByCreator[key] ?? [],
    monthly: monthlyEarningsByCreator[key] ?? [],
    payoutMethods: payoutMethodsByCreator[key] ?? [],
    totals: totals(key),
  };
}

export async function getDemoConversations(key: CreatorHandleKey) {
  const conversations = conversationsByCreator[key] ?? [];
  return conversations.map((conversation) => ({
    ...conversation,
    messages: messagesByConversation[conversation.id] ?? [],
  }));
}

export async function getDemoAffiliateReferrals(key: CreatorHandleKey) {
  return affiliateReferralsByCreator[key] ?? [];
}

export async function getDemoAnalytics(key: CreatorHandleKey) {
  return {
    snapshot: analyticsByCreator[key],
    posts: linkedinPostsByCreator[key] ?? [],
  };
}

export { isMarketplaceUnlocked };

// --- Opportunities (brand campaigns visible to an unlocked creator) -------

export async function getDemoOpportunities() {
  return getDemoOpportunitiesSync();
}

// --- Brand accessors --------------------------------------------------------

export async function getDemoBrand(key: BrandHandleKey) {
  return brandProfiles[key];
}

export async function getDemoBrandCampaigns(key: BrandHandleKey) {
  return Object.values(campaigns).filter((c) => c.brandProfileId === brandProfiles[key].profileId);
}

export async function getDemoMatchingCreators() {
  return (Object.keys(creatorProfiles) as CreatorHandleKey[])
    .filter((key) => isMarketplaceUnlocked(key))
    .map((key) => ({ profile: creatorProfiles[key], card: creatorCards[key] }));
}

export { creatorProfiles, creatorCards, brandProfiles, campaigns, MARKETPLACE_FOLLOWER_THRESHOLD };

"use client";

import { useDemoPersonaStore } from "@/stores/demo-persona-store";
import { creatorProfiles, creatorCards, launchGuideSteps, isMarketplaceUnlocked } from "@/lib/demo-data/creators";
import { collaborationsByCreator } from "@/lib/demo-data/collaborations";
import { earningsByCreator, monthlyEarningsByCreator, payoutMethodsByCreator, totals } from "@/lib/demo-data/earnings";
import { conversationsByCreator, messagesByConversation } from "@/lib/demo-data/messages";
import { affiliateReferralsByCreator } from "@/lib/demo-data/affiliate";
import { analyticsByCreator, linkedinPostsByCreator } from "@/lib/demo-data/analytics";

/**
 * Reads the currently-selected demo persona and returns its full data bundle
 * synchronously. Stands in for a real authenticated session — every value
 * here comes from lib/demo-data and is removed once Phase 2 wires real
 * Supabase queries scoped to the logged-in user.
 */
export function useCreatorPersona() {
  const { creator } = useDemoPersonaStore();

  const profile = creatorProfiles[creator];
  const card = creatorCards[creator];
  const conversations = (conversationsByCreator[creator] ?? []).map((c) => ({
    ...c,
    messages: messagesByConversation[c.id] ?? [],
  }));

  return {
    key: creator,
    profile,
    card,
    launchGuide: launchGuideSteps(creator),
    unlocked: isMarketplaceUnlocked(creator),
    collaborations: collaborationsByCreator[creator] ?? [],
    earnings: {
      entries: earningsByCreator[creator] ?? [],
      monthly: monthlyEarningsByCreator[creator] ?? [],
      payoutMethods: payoutMethodsByCreator[creator] ?? [],
      totals: totals(creator),
    },
    conversations,
    affiliateReferrals: affiliateReferralsByCreator[creator] ?? [],
    analytics: {
      snapshot: analyticsByCreator[creator],
      posts: linkedinPostsByCreator[creator] ?? [],
    },
  };
}

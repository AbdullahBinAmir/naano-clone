import type { CreatorCard, CreatorProfile, LaunchGuideStep } from "@/types/domain";

/**
 * Three personas exercise every conditional state in the Phase 1 UI without
 * a backend: an above-threshold creator with a full pipeline, an
 * above-threshold creator with an empty pipeline, and a below-threshold
 * (locked) creator.
 */
export const creatorProfiles: Record<string, CreatorProfile> = {
  alexis: {
    profileId: "creator-alexis",
    handle: "alexis-jarre",
    displayName: "Alexis Jarre",
    avatarUrl: "/images/avatars/alexis.jpg",
    headline: "I write about GTM for B2B SaaS founders",
    bio: "Ex-growth lead turned full-time creator. I break down go-to-market plays for 40,000+ SaaS operators on LinkedIn — pricing, positioning, and the campaigns that actually move pipeline.",
    location: "Paris, France",
    categoryTags: ["B2B", "SaaS", "Growth"],
    followerCount: 42300,
    isMarketplaceVisible: true,
    linkedinPublicUrl: "https://www.linkedin.com/in/alexis-jarre-demo",
  },
  marcus: {
    profileId: "creator-marcus",
    handle: "marcus-oduya",
    displayName: "Marcus Oduya",
    avatarUrl: "/images/avatars/marcus.jpg",
    headline: "Voice of RevOps for mid-market teams",
    bio: "I've run RevOps at three Series B startups. Now I write about the systems that actually keep a pipeline honest — CRM hygiene, forecasting, and the tools worth paying for.",
    location: "London, UK",
    categoryTags: ["RevOps", "B2B", "AI"],
    followerCount: 8100,
    isMarketplaceVisible: true,
    linkedinPublicUrl: "https://www.linkedin.com/in/marcus-oduya-demo",
  },
  juliette: {
    profileId: "creator-juliette",
    handle: "juliette-caron",
    displayName: "Juliette Caron",
    avatarUrl: "/images/avatars/juliette.jpg",
    headline: "Design engineer sharing what I learn in public",
    bio: "Building in public as a design engineer. New here — still finding my voice and my audience.",
    location: "Lyon, France",
    categoryTags: ["Design", "B2C", "AI"],
    followerCount: 340,
    isMarketplaceVisible: false,
    linkedinPublicUrl: "https://www.linkedin.com/in/juliette-caron-demo",
  },
};

export const creatorCards: Record<string, CreatorCard> = {
  alexis: {
    creatorProfileId: "creator-alexis",
    pricePerPost: 620,
    bannerUrl: "/images/banners/alexis-banner.jpg",
    cardSlug: "alexis-jarre",
    dealLinkToken: "dl_alexis_9f21c",
    publishedAt: "2026-01-14T09:00:00.000Z",
    sharePercent: 25,
    rewardWindowMonths: 3,
    samplePostUrls: [
      "https://www.linkedin.com/posts/alexis-jarre-demo_gtm-pricing-1",
      "https://www.linkedin.com/posts/alexis-jarre-demo_gtm-positioning-2",
      "https://www.linkedin.com/posts/alexis-jarre-demo_gtm-campaigns-3",
    ],
  },
  marcus: {
    creatorProfileId: "creator-marcus",
    pricePerPost: 280,
    bannerUrl: "/images/banners/marcus-banner.jpg",
    cardSlug: "marcus-oduya",
    dealLinkToken: "dl_marcus_7a03e",
    publishedAt: "2026-04-02T09:00:00.000Z",
    sharePercent: 25,
    rewardWindowMonths: 3,
    samplePostUrls: [
      "https://www.linkedin.com/posts/marcus-oduya-demo_revops-forecasting-1",
      "https://www.linkedin.com/posts/marcus-oduya-demo_revops-crm-2",
    ],
  },
  juliette: {
    creatorProfileId: "creator-juliette",
    pricePerPost: 120,
    bannerUrl: "/images/banners/juliette-banner.jpg",
    cardSlug: "juliette-caron",
    dealLinkToken: "dl_juliette_2b88f",
    publishedAt: null,
    sharePercent: 25,
    rewardWindowMonths: 3,
    samplePostUrls: [],
  },
};

const MARKETPLACE_THRESHOLD = 1000;

export function launchGuideSteps(handle: string): LaunchGuideStep[] {
  const creator = creatorProfiles[handle];
  const unlocked = creator.followerCount >= MARKETPLACE_THRESHOLD;
  return [
    {
      id: "card-and-price",
      title: "Card and price ready",
      description: "Your positioning and offer are ready to review.",
      status: "complete",
    },
    {
      id: "marketplace-threshold",
      title: "Reach the Marketplace audience threshold",
      description: "Your workspace and card remain available while your audience grows.",
      status: unlocked ? "complete" : "locked",
    },
  ];
}

export const MARKETPLACE_FOLLOWER_THRESHOLD = MARKETPLACE_THRESHOLD;

export function isMarketplaceUnlocked(handle: string) {
  return creatorProfiles[handle].followerCount >= MARKETPLACE_THRESHOLD;
}

import type { BrandProfile, Campaign } from "@/types/domain";

export const brandProfiles: Record<string, BrandProfile> = {
  ferngrove: {
    profileId: "brand-ferngrove",
    companyName: "Ferngrove",
    industry: "Sales engagement software",
    logoUrl: "/images/logos/ferngrove.svg",
    planTier: "self_serve",
  },
  bramble: {
    profileId: "brand-bramble",
    companyName: "Bramble",
    industry: "Design tooling for revenue teams",
    logoUrl: "/images/logos/bramble.svg",
    planTier: "managed",
  },
  northloop: {
    profileId: "brand-northloop",
    companyName: "Northloop",
    industry: "Pipeline forecasting",
    logoUrl: "/images/logos/northloop.svg",
    planTier: "self_serve",
  },
};

export const campaigns: Record<string, Campaign> = {
  "ferngrove-outbound": {
    id: "campaign-ferngrove-outbound",
    brandProfileId: "brand-ferngrove",
    title: "Outbound playbook launch",
    briefText:
      "Share how your audience thinks about outbound in 2026 and where Ferngrove fits into a modern sequence. Native voice, no script.",
    budget: 3200,
    targetVertical: "B2B SaaS, RevOps, Sales",
    status: "published",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  "bramble-design-week": {
    id: "campaign-bramble-design-week",
    brandProfileId: "brand-bramble",
    title: "Design Week spotlight",
    briefText:
      "A first-look post covering Bramble's new collaborative canvas, framed around a real workflow problem you've hit.",
    budget: 1800,
    targetVertical: "Design, B2B",
    status: "published",
    createdAt: "2026-08-10T10:00:00.000Z",
  },
  "northloop-forecast": {
    id: "campaign-northloop-forecast",
    brandProfileId: "brand-northloop",
    title: "Forecasting accuracy series",
    briefText: "Three-post arc on why most forecasts are wrong and what a tighter process looks like.",
    budget: 4600,
    targetVertical: "RevOps, Sales leadership",
    status: "draft",
    createdAt: "2026-08-20T10:00:00.000Z",
  },
};

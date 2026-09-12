import { brandProfiles, campaigns } from "./brands";

export function getDemoOpportunitiesSync() {
  return Object.values(campaigns)
    .filter((c) => c.status === "published")
    .map((c) => ({
      ...c,
      brand: Object.values(brandProfiles).find((b) => b.profileId === c.brandProfileId),
    }));
}

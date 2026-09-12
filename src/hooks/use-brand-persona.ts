"use client";

import { useDemoPersonaStore } from "@/stores/demo-persona-store";
import { brandProfiles, campaigns } from "@/lib/demo-data/brands";
import { getDemoMatchingCreatorsSync } from "@/lib/demo-data/matching";

export function useBrandPersona() {
  const { brand } = useDemoPersonaStore();
  const profile = brandProfiles[brand];

  return {
    key: brand,
    profile,
    campaigns: Object.values(campaigns).filter((c) => c.brandProfileId === profile.profileId),
    matchingCreators: getDemoMatchingCreatorsSync(),
  };
}

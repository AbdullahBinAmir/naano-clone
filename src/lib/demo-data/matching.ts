import { creatorProfiles, creatorCards, isMarketplaceUnlocked } from "./creators";

type CreatorKey = keyof typeof creatorProfiles;

export function getDemoMatchingCreatorsSync() {
  return (Object.keys(creatorProfiles) as CreatorKey[])
    .filter((key) => isMarketplaceUnlocked(key))
    .map((key) => ({ key, profile: creatorProfiles[key], card: creatorCards[key] }));
}

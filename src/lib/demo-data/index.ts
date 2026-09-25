import { creatorCards, creatorProfiles, launchGuideSteps } from "./creators";

export type CreatorHandleKey = "alexis" | "marcus" | "juliette";
export const DEFAULT_CREATOR: CreatorHandleKey = "alexis";

export type BrandHandleKey = "ferngrove" | "bramble" | "northloop";
export const DEFAULT_BRAND: BrandHandleKey = "ferngrove";

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

export { creatorCards };

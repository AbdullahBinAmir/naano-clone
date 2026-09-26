import type { ShowcaseCreator } from "@/lib/marketing/get-landing-data";

/**
 * Stock photography for the marketing landing page (Unsplash License, stored in
 * /public/landing). Portraits only stand in until a creator uploads their own
 * avatar — a real avatar_url always wins.
 */
export const PORTRAITS = Array.from({ length: 10 }, (_, i) => `/landing/portrait-${String(i + 1).padStart(2, "0")}.jpg`);

export const SCENES = {
  team: "/landing/scene-1.jpg",
  brainstorm: "/landing/scene-2.jpg",
  celebrate: "/landing/scene-3.jpg",
  whiteboard: "/landing/scene-4.jpg",
  desk: "/landing/scene-5.jpg",
  loft: "/landing/scene-6.jpg",
  laptop: "/landing/scene-7.jpg",
} as const;

export type ShowcaseCreatorWithPhoto = Omit<ShowcaseCreator, "avatarUrl"> & { avatarUrl: string };

export function withPortraits(creators: ShowcaseCreator[]): ShowcaseCreatorWithPhoto[] {
  return creators.map((c, i) => ({ ...c, avatarUrl: c.avatarUrl ?? PORTRAITS[i % PORTRAITS.length] }));
}

/** Decorative faces (no names) used to keep the hero orbit full when few creators exist. */
export function orbitAvatars(creators: ShowcaseCreatorWithPhoto[], count: number) {
  const list = creators.slice(0, count).map((c) => ({ src: c.avatarUrl, name: c.name }));
  for (let i = 0; list.length < count; i++) {
    const src = PORTRAITS[(creators.length + i + 3) % PORTRAITS.length];
    if (!list.some((a) => a.src === src)) list.push({ src, name: "" });
  }
  return list;
}

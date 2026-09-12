import { z } from "zod";

export const updateCreatorCardSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(120),
  headline: z.string().trim().max(200),
  bio: z.string().trim().max(2000),
  location: z.string().trim().max(120),
  categoryTags: z.array(z.string().trim().min(1)).max(6),
  pricePerPost: z.number().nonnegative().max(1_000_000),
});

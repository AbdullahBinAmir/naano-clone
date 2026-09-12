import { z } from "zod";

export const analyticsSnapshotSchema = z.object({
  followerCount: z.number().int().nonnegative().max(50_000_000),
  publicPostReach: z.number().int().nonnegative().max(1_000_000_000).nullable(),
  publicPostsCount: z.number().int().nonnegative().max(100_000),
  publicEngagements: z.number().int().nonnegative().max(100_000_000),
  pctPostsWithReachData: z.number().min(0).max(100),
});

export const csvPostRowSchema = z.object({
  post_url: z.string().trim().url(),
  posted_at: z.string().trim().min(1),
  reach: z.union([z.string(), z.number()]).optional(),
  engagements: z.union([z.string(), z.number()]).optional(),
});

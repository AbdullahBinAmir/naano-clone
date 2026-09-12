import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  briefText: z.string().trim().max(2000),
  budget: z.number().nonnegative().max(1_000_000),
  targetVertical: z.string().trim().max(200),
});

export const campaignStatusSchema = z.object({
  campaignId: z.string().uuid(),
  status: z.enum(["draft", "published", "closed"]),
});

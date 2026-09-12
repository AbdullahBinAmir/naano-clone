import { z } from "zod";

export const applyToCampaignSchema = z.object({
  campaignId: z.string().uuid(),
});

export const inviteCreatorSchema = z.object({
  creatorProfileId: z.string().uuid(),
  agreedPrice: z.number().nonnegative().max(1_000_000),
});

export const collaborationActionSchema = z.object({
  collaborationId: z.string().uuid(),
  action: z.enum(["accept", "decline", "complete"]),
});

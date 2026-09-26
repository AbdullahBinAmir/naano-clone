import { z } from "zod";

export const applyToCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  /** Optional pitch shown to the brand as the first message in the thread. */
  note: z.string().trim().max(500, "Keep your note under 500 characters").optional(),
});

export const inviteCreatorSchema = z.object({
  creatorProfileId: z.string().uuid(),
  agreedPrice: z.number().nonnegative().max(1_000_000),
});

export const submitPostSchema = z.object({
  collaborationId: z.string().uuid(),
  postUrl: z
    .string()
    .trim()
    .max(500)
    .regex(/^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/.+/i, "Enter the full LinkedIn post URL (https://www.linkedin.com/…)"),
});

export const requestRevisionSchema = z.object({
  collaborationId: z.string().uuid(),
  note: z.string().trim().min(1, "Tell the creator what to change").max(500),
});

export const openDisputeSchema = z.object({
  collaborationId: z.string().uuid(),
  reason: z.string().trim().min(10, "Describe the problem in at least 10 characters").max(1000),
});

export const collaborationIdSchema = z.object({ collaborationId: z.string().uuid() });

export const collaborationActionSchema = z.object({
  collaborationId: z.string().uuid(),
  action: z.enum(["accept", "decline", "complete"]),
});

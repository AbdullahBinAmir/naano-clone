import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Write something first").max(4000),
});

export const startDirectConversationSchema = z.object({
  otherProfileId: z.string().uuid(),
});

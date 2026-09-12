"use server";

import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema, startDirectConversationSchema } from "@/lib/validations/messages";

export interface MessageActionResult {
  error?: string;
  message?: { id: string; createdAt: string };
}

export interface StartConversationResult {
  error?: string;
  conversationId?: string;
}

/**
 * Starts (or reuses) a conversation with someone the caller hasn't
 * necessarily collaborated with yet — a brand messaging a creator from
 * Match, or a creator messaging the brand behind an open campaign. A
 * SECURITY DEFINER RPC (see supabase/migrations/0012_direct_conversations.sql)
 * since it must add the OTHER party as a participant too, which a plain
 * owner-scoped insert can't express.
 */
export async function startDirectConversationAction(input: unknown): Promise<StartConversationResult> {
  const parsed = startDirectConversationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  const { data, error } = await supabase.rpc("create_direct_conversation", {
    p_other_profile_id: parsed.data.otherProfileId,
  });
  if (error) return { error: error.message };

  return { conversationId: data };
}

export async function sendMessageAction(input: unknown): Promise<MessageActionResult> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in first." };

  // RLS also enforces this (the insert policy requires an existing
  // conversation_participants row for the caller), but checking here first
  // gives a clearer error than a raw RLS-denied message.
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", parsed.data.conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!participant) return { error: "You're not part of this conversation." };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: parsed.data.conversationId,
      sender_profile_id: user.id,
      body: parsed.data.body,
      is_system: false,
    })
    .select("id, created_at")
    .single();
  if (error) return { error: error.message };

  return { message: { id: data.id, createdAt: data.created_at } };
}

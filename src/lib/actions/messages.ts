"use server";

import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validations/messages";

export interface MessageActionResult {
  error?: string;
  message?: { id: string; createdAt: string };
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

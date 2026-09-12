import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ConversationWithMessages {
  id: string;
  isSystem: boolean;
  counterpartName: string;
  counterpartAvatarUrl: string;
  lastMessageAt: string;
  messages: { id: string; body: string; senderIsSelf: boolean; isSystem: boolean; createdAt: string }[];
}

/**
 * Assembles every conversation the given user participates in, resolving
 * the other party's display name from creator_profiles or brand_profiles
 * depending on the viewer's own role (a creator's counterpart is always a
 * brand and vice versa — conversations only ever have 0 or 2 non-system
 * participants per supabase/migrations/0006_conversation_functions.sql).
 */
export async function getConversationsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  viewerRole: "creator" | "brand",
): Promise<ConversationWithMessages[]> {
  const { data: myParticipation } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId);
  const conversationIds = (myParticipation ?? []).map((p) => p.conversation_id);
  if (conversationIds.length === 0) return [];

  const [{ data: conversations }, { data: otherParticipants }, { data: messages }] = await Promise.all([
    supabase.from("conversations").select("*").in("id", conversationIds),
    supabase.from("conversation_participants").select("conversation_id, profile_id").in("conversation_id", conversationIds).neq("profile_id", userId),
    supabase.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: true }),
  ]);

  const counterpartProfileIds = [...new Set((otherParticipants ?? []).map((p) => p.profile_id))];

  const counterpartByProfileId = new Map<string, { name: string; avatarUrl: string }>();
  if (counterpartProfileIds.length > 0) {
    if (viewerRole === "creator") {
      const { data: brands } = await supabase
        .from("brand_profiles")
        .select("profile_id, company_name, logo_url")
        .in("profile_id", counterpartProfileIds);
      for (const b of brands ?? []) counterpartByProfileId.set(b.profile_id, { name: b.company_name, avatarUrl: b.logo_url });
    } else {
      const { data: creators } = await supabase
        .from("creator_profiles")
        .select("profile_id, display_name, avatar_url")
        .in("profile_id", counterpartProfileIds);
      for (const c of creators ?? []) counterpartByProfileId.set(c.profile_id, { name: c.display_name, avatarUrl: c.avatar_url });
    }
  }
  const otherParticipantByConversation = new Map((otherParticipants ?? []).map((p) => [p.conversation_id, p.profile_id]));

  const result: ConversationWithMessages[] = (conversations ?? []).map((conv) => {
    const convMessages = (messages ?? [])
      .filter((m) => m.conversation_id === conv.id)
      .map((m) => ({
        id: m.id,
        body: m.body,
        senderIsSelf: m.sender_profile_id === userId,
        isSystem: m.is_system,
        createdAt: m.created_at,
      }));

    const counterpartId = otherParticipantByConversation.get(conv.id);
    const counterpart = counterpartId ? counterpartByProfileId.get(counterpartId) : undefined;

    return {
      id: conv.id,
      isSystem: conv.is_system,
      counterpartName: conv.is_system ? "NaanoBot" : (counterpart?.name ?? (viewerRole === "creator" ? "Brand" : "Creator")),
      counterpartAvatarUrl: conv.is_system ? "" : (counterpart?.avatarUrl ?? ""),
      lastMessageAt: convMessages.at(-1)?.createdAt ?? conv.created_at,
      messages: convMessages,
    };
  });

  result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return result;
}

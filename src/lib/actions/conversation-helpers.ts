import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Seeds the shared conversation for a new collaboration and, if this is the
 * creator's first-ever booking, their NaanoBot welcome thread. Both calls
 * are RPCs to SECURITY DEFINER functions (see
 * supabase/migrations/0006_conversation_functions.sql) since inserting a
 * conversation_participants row for someone *other* than the caller can't
 * be expressed as plain owner-scoped RLS. Best-effort: a failure here
 * shouldn't roll back or block the collaboration itself.
 */
export async function seedCollaborationConversation(
  supabase: SupabaseClient<Database>,
  params: { collaborationId: string; creatorProfileId: string; brandProfileId: string },
) {
  try {
    await supabase.rpc("create_collaboration_conversation", {
      p_collaboration_id: params.collaborationId,
      p_creator_profile_id: params.creatorProfileId,
      p_brand_profile_id: params.brandProfileId,
    });
    await supabase.rpc("ensure_naanobot_welcome", { p_creator_profile_id: params.creatorProfileId });
  } catch (e) {
    console.error("seedCollaborationConversation failed (non-fatal):", e);
  }
}

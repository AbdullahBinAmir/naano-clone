import { PageHeader } from "@/components/layout/page-header";
import { MessagesView } from "@/components/messages/messages-view";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getConversationsForUser } from "@/lib/messaging/get-conversations";

export default async function BrandMessagesPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();
  const conversations = await getConversationsForUser(supabase, user.id, "brand");

  return (
    <>
      <PageHeader eyebrow="Messages" title="Messages" />
      <MessagesView conversations={conversations} currentUserId={user.id} />
    </>
  );
}

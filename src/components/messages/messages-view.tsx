"use client";

import * as React from "react";
import { toast } from "sonner";
import { MessageSquare, Search, Send } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "@/lib/actions/messages";
import { cn, initials } from "@/lib/utils";
import type { ConversationWithMessages } from "@/lib/messaging/get-conversations";

export function MessagesView({
  conversations: initialConversations,
  currentUserId,
  initialActiveId,
}: {
  conversations: ConversationWithMessages[];
  currentUserId: string;
  initialActiveId?: string;
}) {
  const [conversations, setConversations] = React.useState(initialConversations);
  const [activeId, setActiveId] = React.useState(
    (initialActiveId && initialConversations.some((c) => c.id === initialActiveId)
      ? initialActiveId
      : initialConversations[0]?.id),
  );
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const active = conversations.find((c) => c.id === activeId);

  // Adjusting state during render (React's documented pattern for "reset
  // state when a prop changes") rather than in an effect: fires when
  // navigating here with a new ?conversation=<id> (e.g. just started via
  // "Message" from Match or an opportunity) — merges the freshly-fetched
  // conversation in without discarding whatever's already accumulated in
  // local state from realtime/optimistic sends.
  const [appliedActiveId, setAppliedActiveId] = React.useState(initialActiveId);
  if (initialActiveId && initialActiveId !== appliedActiveId) {
    setAppliedActiveId(initialActiveId);
    setActiveId(initialActiveId);
    if (!conversations.some((c) => c.id === initialActiveId)) {
      const fresh = initialConversations.find((c) => c.id === initialActiveId);
      if (fresh) setConversations([fresh, ...conversations]);
    }
  }

  // Realtime keeps the open thread live — most useful when the other party
  // (viewing the same conversation in their own session) sends a message,
  // since that arrives here with no refresh needed.
  React.useEffect(() => {
    if (!activeId) return;
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    // A freshly-created browser client's realtime socket can otherwise start
    // authenticating before the session token finishes loading from storage,
    // so postgres_changes silently evaluates RLS as anon and delivers nothing.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.access_token) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`messages:${activeId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
          (payload) => {
            const row = payload.new as {
              id: string;
              body: string;
              sender_profile_id: string | null;
              is_system: boolean;
              created_at: string;
            };
            setConversations((prev) =>
              prev.map((c) =>
                c.id !== activeId
                  ? c
                  : c.messages.some((m) => m.id === row.id)
                    ? c
                    : {
                        ...c,
                        lastMessageAt: row.created_at,
                        messages: [
                          ...c.messages,
                          {
                            id: row.id,
                            body: row.body,
                            senderIsSelf: row.sender_profile_id === currentUserId,
                            isSystem: row.is_system,
                            createdAt: row.created_at,
                          },
                        ],
                      },
              ),
            );
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeId, currentUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const body = draft.trim();
    setDraft("");
    setSending(true);
    const result = await sendMessageAction({ conversationId: active.id, body });
    setSending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.message) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== active.id
            ? c
            : c.messages.some((m) => m.id === result.message!.id)
              ? c
              : {
                  ...c,
                  lastMessageAt: result.message!.createdAt,
                  messages: [...c.messages, { id: result.message!.id, body, senderIsSelf: true, isSystem: false, createdAt: result.message!.createdAt }],
                },
        ),
      );
    }
  }

  return (
    <GlassCard className="grid grid-cols-1 overflow-hidden p-0 md:grid-cols-[20rem_1fr]" style={{ minHeight: "32rem" }}>
      <div className="flex flex-col border-b border-border md:border-r md:border-b-0">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
          <input placeholder="Search conversations" className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-subtle" />
        </div>
        <div className="flex flex-col overflow-y-auto">
          {conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                  activeId === c.id && "bg-white/[0.06]",
                )}
              >
                <Avatar
                  src={c.isSystem ? null : c.counterpartAvatarUrl}
                  alt={c.counterpartName}
                  fallback={initials(c.counterpartName)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.counterpartName}</p>
                  <p className="truncate text-xs text-foreground-subtle">{last?.body ?? "No messages yet"}</p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="p-6 text-center text-sm text-foreground-muted">
              No conversations yet - the thread opens with your first Booking.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="border-b border-border p-4">
          <p className="font-semibold">Messages</p>
          <p className="text-xs text-foreground-subtle">{active ? active.counterpartName : "Select a conversation"}</p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {active ? (
            active.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.senderIsSelf && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm",
                    m.senderIsSelf ? "bg-accent text-accent-foreground" : "glass-surface",
                  )}
                >
                  {m.body}
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-foreground-muted">
              <MessageSquare className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
              No conversations yet.
            </div>
          )}
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-4">
          <input
            className="input"
            placeholder="Write a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!active || sending}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!active || !draft.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </GlassCard>
  );
}

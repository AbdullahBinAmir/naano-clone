"use client";

import * as React from "react";
import { MessageSquare, Search, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { useCreatorPersona } from "@/hooks/use-creator-persona";
import { cn, initials } from "@/lib/utils";

export default function MessagesPage() {
  const { conversations } = useCreatorPersona();
  const [activeId, setActiveId] = React.useState(conversations[0]?.id);
  const [draft, setDraft] = React.useState("");
  const [localMessages, setLocalMessages] = React.useState<Record<string, string[]>>({});
  const active = conversations.find((c) => c.id === activeId);
  const sentMessages = active ? localMessages[active.id] ?? [] : [];

  return (
    <>
      <PageHeader eyebrow="Messages" title="Messages" />

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
                    src={c.isSystem ? c.participantAvatarUrl : null}
                    alt={c.participantName}
                    fallback={initials(c.participantName)}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.participantName}</p>
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
            <p className="text-xs text-foreground-subtle">{active ? active.participantName : "Select a conversation"}</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {active ? (
              <>
                {active.messages.map((m) => (
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
                ))}
                {sentMessages.map((body, i) => (
                  <div key={`local-${i}`} className="flex justify-end">
                    <div className="max-w-[80%] rounded-lg bg-accent px-3.5 py-2.5 text-sm text-accent-foreground">
                      {body}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-foreground-muted">
                <MessageSquare className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
                No conversations yet.
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim() || !active) return;
              setLocalMessages((prev) => ({ ...prev, [active.id]: [...(prev[active.id] ?? []), draft.trim()] }));
              setDraft("");
            }}
            className="flex items-center gap-2 border-t border-border p-4"
          >
            <input
              className="input"
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!active}
            />
            <button
              type="submit"
              disabled={!active || !draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </GlassCard>
    </>
  );
}

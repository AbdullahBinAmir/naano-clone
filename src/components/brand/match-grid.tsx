"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, MessageSquare, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inviteCreatorAction } from "@/lib/actions/collaborations";
import { startDirectConversationAction } from "@/lib/actions/messages";
import { formatCurrency, initials } from "@/lib/utils";

interface MatchCreator {
  profileId: string;
  displayName: string;
  avatarUrl: string;
  headline: string;
  location: string;
  categoryTags: string[];
  pricePerPost: number;
}

export function MatchGrid({ creators }: { creators: MatchCreator[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [invitingId, setInvitingId] = React.useState<string | null>(null);
  const [messagingId, setMessagingId] = React.useState<string | null>(null);

  const filtered = creators.filter((c) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return c.displayName.toLowerCase().includes(q) || c.categoryTags.some((t) => t.toLowerCase().includes(q));
  });

  async function handleInvite(creator: MatchCreator) {
    setInvitingId(creator.profileId);
    const result = await inviteCreatorAction({ creatorProfileId: creator.profileId, agreedPrice: creator.pricePerPost });
    setInvitingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Invitation sent to ${creator.displayName}`);
    router.refresh();
  }

  async function handleMessage(creator: MatchCreator) {
    setMessagingId(creator.profileId);
    const result = await startDirectConversationAction({ otherProfileId: creator.profileId });
    setMessagingId(null);

    if (result.error || !result.conversationId) {
      toast.error(result.error ?? "Couldn't start that conversation.");
      return;
    }
    router.push(`/dashboard/brand/messages?conversation=${result.conversationId}`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Match"
        title="Find creators your buyers already trust"
        description="Filter by vertical or ICP to see who's a fit — invite them, they accept, and the booking runs on Naano."
      />

      <GlassCard className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border-strong bg-white/[0.04] px-3 py-2">
          <Search className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            placeholder="Search by name, vertical, or topic (e.g. RevOps, B2B, AI)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="glass" onClick={() => setQuery("")}>
          Clear
        </Button>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <GlassCard key={c.profileId} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={c.avatarUrl} alt={c.displayName} fallback={initials(c.displayName)} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.displayName}</p>
                {c.location && (
                  <p className="flex items-center gap-1 text-xs text-foreground-subtle">
                    <MapPin className="h-3 w-3" strokeWidth={1.75} />
                    {c.location}
                  </p>
                )}
              </div>
            </div>
            <p className="line-clamp-2 text-sm text-foreground-muted">{c.headline}</p>
            <div className="flex flex-wrap gap-1.5">
              {c.categoryTags.map((t) => (
                <Badge key={t} variant="accent">
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="font-semibold">{formatCurrency(c.pricePerPost)} / post</span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => handleMessage(c)}
                  disabled={messagingId === c.profileId}
                  aria-label={`Message ${c.displayName}`}
                >
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
                <Button size="sm" variant="primary" onClick={() => handleInvite(c)} disabled={invitingId === c.profileId}>
                  {invitingId === c.profileId ? "Inviting…" : "Invite"}
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-foreground-muted">
            {creators.length === 0
              ? "No creators are marketplace-visible yet — they unlock at 1,000 followers with a published card."
              : "No creators match that search."}
          </p>
        )}
      </div>
    </>
  );
}

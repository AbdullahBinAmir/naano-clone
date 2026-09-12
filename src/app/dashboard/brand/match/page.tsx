"use client";

import * as React from "react";
import { toast } from "sonner";
import { MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrandPersona } from "@/hooks/use-brand-persona";
import { formatCurrency, initials } from "@/lib/utils";

export default function MatchPage() {
  const { matchingCreators } = useBrandPersona();
  const [query, setQuery] = React.useState("");

  const filtered = matchingCreators.filter((c) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      c.profile.displayName.toLowerCase().includes(q) ||
      c.profile.categoryTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <PageHeader
        eyebrow="Match"
        title="Find creators your buyers already trust"
        description="Filter by vertical or ICP to see who's a fit — apply, they accept, and the booking runs on Naano."
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
          <GlassCard key={c.profile.handle} interactive className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={c.profile.avatarUrl} alt={c.profile.displayName} fallback={initials(c.profile.displayName)} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.profile.displayName}</p>
                <p className="flex items-center gap-1 text-xs text-foreground-subtle">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} />
                  {c.profile.location}
                </p>
              </div>
            </div>
            <p className="line-clamp-2 text-sm text-foreground-muted">{c.profile.headline}</p>
            <div className="flex flex-wrap gap-1.5">
              {c.profile.categoryTags.map((t) => (
                <Badge key={t} variant="accent">
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="font-semibold">{formatCurrency(c.card.pricePerPost)} / post</span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => toast.success(`Invitation sent to ${c.profile.displayName}`)}
              >
                Invite
              </Button>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-foreground-muted">No creators match that search.</p>
        )}
      </div>
    </>
  );
}

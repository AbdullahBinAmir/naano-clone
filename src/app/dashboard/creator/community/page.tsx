"use client";

import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Share2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreatorCardPreview } from "@/components/creator/creator-card-preview";
import { useCreatorPersona } from "@/hooks/use-creator-persona";

const COMMUNITY_MEMBERS = ["EJ", "TM", "SR", "AL", "PK", "MN"];

export default function CommunityPage() {
  const { profile, card, analytics } = useCreatorPersona();

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Community"
        description="Learn with other B2B creators, share what works and make your Naano identity visible."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="flex flex-col gap-4">
          <p className="text-xs font-medium tracking-wide text-foreground-subtle uppercase">Naano creators on Slack</p>
          <h2 className="text-xl font-semibold">The room where B2B creators get better together.</h2>
          <div className="flex -space-x-2">
            {COMMUNITY_MEMBERS.map((m) => (
              <Avatar key={m} alt={m} fallback={m} size="sm" className="border-2 border-surface-1" />
            ))}
          </div>
          <p className="text-sm text-foreground-muted">
            Ask for feedback on a sponsored post, compare campaign lessons, meet creators in your language and help
            shape what Naano builds next.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {["Get feedback before you publish", "Share campaign tips that work", "Talk directly with the Naano team"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2 text-foreground-muted">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
                  {item}
                </li>
              ),
            )}
          </ul>
          <Button
            variant="glass"
            className="justify-between"
            onClick={() => toast("The Slack community link isn't public in this demo.")}
          >
            Join the Slack community
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground-subtle uppercase">
            <Share2 className="h-4 w-4 text-accent" strokeWidth={1.75} />
            LinkedIn visibility
          </div>
          <h2 className="text-xl font-semibold">Turn your LinkedIn profile into an always-on deal link.</h2>
          <p className="text-sm text-foreground-muted">
            Add your creator card to LinkedIn so brands can discover your work and join Naano through your attributed
            link.
          </p>
          <div className="glass-surface flex items-center justify-between rounded-lg p-4">
            <div>
              <p className="text-2xl font-semibold text-accent">{card.sharePercent}%</p>
              <p className="text-xs text-foreground-subtle">of Naano&apos;s commission for {card.rewardWindowMonths} months</p>
            </div>
            <p className="max-w-[12rem] text-xs text-foreground-muted">
              Leave your card on your LinkedIn profile. If a brand joins Naano through it, your reward is tracked
              automatically.
            </p>
          </div>
          <CreatorCardPreview profile={profile} card={card} reach={analytics.snapshot.publicPostReach} />
        </GlassCard>
      </div>
    </>
  );
}

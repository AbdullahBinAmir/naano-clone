"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, CheckCircle2, ChevronRight, Circle, Copy, Eye, FileText, Share2, SquareArrowOutUpRight, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/creator/stat-tile";
import { GlassCard } from "@/components/glass/glass-card";
import { CreatorCardPreview } from "@/components/creator/creator-card-preview";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { useCreatorPersona } from "@/hooks/use-creator-persona";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";

export default function CreatorOverviewPage() {
  const { profile, card, launchGuide, analytics } = useCreatorPersona();
  const router = useRouter();
  const firstName = profile.displayName.split(" ")[0];

  function copyLink() {
    navigator.clipboard.writeText(`https://naano.com/creators/${card.cardSlug}`);
    toast.success("Card link copied");
  }

  async function shareCard() {
    const url = `https://naano.com/creators/${card.cardSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile.displayName} on Naano`, url });
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Card link copied — share it anywhere");
    }
  }

  const followerProgress = Math.min(100, (profile.followerCount / MARKETPLACE_FOLLOWER_THRESHOLD) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Creator workspace"
        title={`Good to see you, ${firstName}`}
        description="Your creator activity, at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
          label="Public post reach"
          value={analytics.snapshot.publicPostReach}
          pending={analytics.snapshot.publicPostReach === null}
          caption={analytics.snapshot.publicPostReach === null ? "Waiting for public post data" : "Across your recent posts"}
        />
        <StatTile
          icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
          label="Public posts"
          value={analytics.snapshot.publicPostsCount}
          caption="Original LinkedIn posts found"
        />
        <StatTile
          icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
          label="Public engagements"
          value={analytics.snapshot.publicEngagements}
          caption="Reactions, comments and reposts"
        />
        <StatTile
          icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
          label="LinkedIn followers"
          value={analytics.snapshot.followerCount}
          pending={analytics.snapshot.followerCount === null}
          caption="Imported from the public profile"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Your creator card</h2>
              <p className="mt-1 text-sm text-foreground-muted">
                This is how brands discover your positioning and collaboration offer.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="glass" size="sm" onClick={() => router.push(`/creators/${card.cardSlug}`)}>
              <SquareArrowOutUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              Open card
            </Button>
            <Button variant="glass" size="sm" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Copy card link
            </Button>
            <Button variant="primary" size="sm" onClick={shareCard}>
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Share my card
            </Button>
          </div>
          <CreatorCardPreview profile={profile} card={card} reach={analytics.snapshot.publicPostReach} />
        </GlassCard>

        <GlassCard className="flex flex-col gap-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your launch guide</h2>
            <span className="text-sm text-foreground-muted">
              {launchGuide.filter((s) => s.status === "complete").length} of {launchGuide.length} steps complete
            </span>
          </div>
          <div className="flex flex-col">
            {launchGuide.map((step, i) => (
              <div key={step.id}>
                {i > 0 && <div className="h-px bg-border" />}
                <div className="flex items-center gap-4 py-4">
                  {step.status === "complete" ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-success" strokeWidth={1.5} />
                  ) : (
                    <Circle className="h-6 w-6 shrink-0 text-foreground-subtle" strokeWidth={1.5} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-foreground-muted">{step.description}</p>
                    {step.status === "locked" && (
                      <div className="mt-2 max-w-xs">
                        <ProgressBar value={followerProgress} />
                        <p className="mt-1 text-xs text-foreground-subtle">
                          {profile.followerCount.toLocaleString()} / {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers
                        </p>
                      </div>
                    )}
                  </div>
                  <span
                    className={
                      step.status === "complete"
                        ? "shrink-0 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success"
                        : "shrink-0 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-foreground-subtle"
                    }
                  >
                    {step.status === "complete" ? "Complete" : "To do"}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

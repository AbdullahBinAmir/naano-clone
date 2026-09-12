"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, CheckCircle2, ChevronRight, Circle, Copy, Eye, FileText, Share2, SquareArrowOutUpRight, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/creator/stat-tile";
import { GlassCard } from "@/components/glass/glass-card";
import { CreatorCardPreview } from "@/components/creator/creator-card-preview";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";
import type { CreatorCard, CreatorProfile } from "@/types/domain";

interface Snapshot {
  publicPostReach: number | null;
  publicPostsCount: number;
  publicEngagements: number;
}

export function OverviewDashboard({
  profile,
  card,
  snapshot,
}: {
  profile: CreatorProfile;
  card: CreatorCard;
  snapshot: Snapshot | null;
}) {
  const router = useRouter();
  const firstName = profile.displayName.split(" ")[0];
  const unlocked = profile.followerCount >= MARKETPLACE_FOLLOWER_THRESHOLD;

  function publicUrl() {
    return `${window.location.origin}/creators/${card.cardSlug}`;
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl());
    toast.success("Card link copied");
  }

  async function shareCard() {
    const url = publicUrl();
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
          value={snapshot?.publicPostReach ?? null}
          pending={!snapshot || snapshot.publicPostReach === null}
          caption={!snapshot || snapshot.publicPostReach === null ? "Add your stats on Analytics" : "Across your recent posts"}
        />
        <StatTile
          icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
          label="Public posts"
          value={snapshot?.publicPostsCount ?? 0}
          caption="From your latest Analytics snapshot"
        />
        <StatTile
          icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
          label="Public engagements"
          value={snapshot?.publicEngagements ?? 0}
          caption="Reactions, comments and reposts"
        />
        <StatTile
          icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
          label="LinkedIn followers"
          value={profile.followerCount}
          caption="Update this on Analytics"
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
          <CreatorCardPreview profile={profile} card={card} reach={snapshot?.publicPostReach} />
        </GlassCard>

        <GlassCard className="flex flex-col gap-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your launch guide</h2>
            <span className="text-sm text-foreground-muted">{unlocked ? 2 : 1} of 2 steps complete</span>
          </div>
          <div className="flex flex-col">
            <LaunchGuideRow
              complete
              title="Card and price ready"
              description="Your positioning and offer are ready to review."
            />
            <div className="h-px bg-border" />
            <LaunchGuideRow
              complete={unlocked}
              title="Reach the Marketplace audience threshold"
              description="Your workspace and card remain available while your audience grows."
              progress={
                !unlocked && (
                  <div className="mt-2 max-w-xs">
                    <ProgressBar value={followerProgress} />
                    <p className="mt-1 text-xs text-foreground-subtle">
                      {profile.followerCount.toLocaleString()} / {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers
                    </p>
                  </div>
                )
              }
            />
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function LaunchGuideRow({
  complete,
  title,
  description,
  progress,
}: {
  complete: boolean;
  title: string;
  description: string;
  progress?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      {complete ? (
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" strokeWidth={1.5} />
      ) : (
        <Circle className="h-6 w-6 shrink-0 text-foreground-subtle" strokeWidth={1.5} />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-foreground-muted">{description}</p>
        {progress}
      </div>
      <span
        className={
          complete
            ? "shrink-0 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success"
            : "shrink-0 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-foreground-subtle"
        }
      >
        {complete ? "Complete" : "To do"}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
    </div>
  );
}

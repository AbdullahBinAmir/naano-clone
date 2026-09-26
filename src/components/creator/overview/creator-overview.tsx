"use client";

import { CURRENCY } from "@/lib/constants";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NumberFlow from "@number-flow/react";
import { toast } from "sonner";
import { Activity, Briefcase, Copy, Eye, FileText, Handshake, Lock, Share2, SquareArrowOutUpRight, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CreatorCardPreview } from "@/components/creator/creator-card-preview";
import { StatTile } from "@/components/creator/stat-tile";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDots, DotGrid } from "@/components/ui/dot-grid";
import { GradientStatCard } from "@/components/ui/gradient-stat-card";
import { ProgressBar } from "@/components/ui/progress";
import { updateCollaborationStatusAction } from "@/lib/actions/collaborations";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";
import { dealProgress } from "@/lib/brand/deal-progress";
import { describeDeadline } from "@/lib/deadline";
import type { CreatorDeal } from "@/lib/creator/get-creator-deals";
import type { OpenBrief } from "@/lib/creator/get-open-briefs";
import { formatCurrency, initials } from "@/lib/utils";
import type { CreatorCard, CreatorProfile } from "@/types/domain";

interface Snapshot {
  publicPostReach: number | null;
  publicPostsCount: number;
  publicEngagements: number;
}

export interface CreatorOverviewProps {
  profile: CreatorProfile;
  card: CreatorCard;
  snapshot: Snapshot | null;
  today: string;
  activeDeals: CreatorDeal[];
  offers: CreatorDeal[];
  openBriefs: OpenBrief[];
  openBriefCount: number;
  earnings: { totalEarned: number; available: number; inTransit: number };
}

const MONEY = { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 } as const;

function daysLeftLabel(daysLeft: number | null) {
  if (daysLeft === null) return "No due date";
  if (daysLeft < 0) return `${-daysLeft}d overdue`;
  if (daysLeft === 0) return "Due today";
  return `${daysLeft}d left`;
}

export function CreatorOverview({
  profile,
  card,
  snapshot,
  today,
  activeDeals,
  offers,
  openBriefs,
  openBriefCount,
  earnings,
}: CreatorOverviewProps) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const firstName = profile.displayName.split(" ")[0];
  const unlocked = profile.followerCount >= MARKETPLACE_FOLLOWER_THRESHOLD;

  async function act(id: string, action: "accept" | "decline" | "complete") {
    setBusyId(id);
    const result = await updateCollaborationStatusAction({ collaborationId: id, action });
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(action === "accept" ? "Offer accepted" : action === "decline" ? "Offer declined" : "Marked as posted");
    router.refresh();
  }

  const publicUrl = () => `${window.location.origin}/creators/${card.cardSlug}`;
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

  return (
    <>
      <PageHeader
        eyebrow="Creator workspace"
        title={`Good to see you, ${firstName}`}
        description="Briefs you can take, deals in flight and what you've earned."
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="active-title" className="flex flex-col gap-4">
            <CardTitle id="active-title" className="text-2xl">
              My active deals
            </CardTitle>
            {activeDeals.length === 0 ? (
              <Card padding="lg" className="flex flex-col items-center gap-3 py-12 text-center text-foreground-muted">
                <Handshake className="h-7 w-7 text-foreground-subtle" strokeWidth={1.5} />
                <p className="font-medium text-foreground">No active deals</p>
                <p className="max-w-sm text-sm">Apply to an open brief below — accepted bookings show up here with a progress tracker.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeDeals.map((d) => {
                  const progress = dealProgress(d.createdAt, d.dueDate, today);
                  const dots = progress.overdue
                    ? buildDots({ total: progress.total, highlight: progress.total })
                    : buildDots({ total: progress.total, accent: progress.filled, ring: progress.filled < progress.total ? 1 : 0 });
                  return (
                    <Card key={d.id} tone="raised" padding="lg" className="flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar src={null} alt={d.brandName} fallback={initials(d.brandName)} className="h-14 w-14" />
                          <div className="min-w-0">
                            <p className="truncate text-lg font-medium">{d.brandName}</p>
                            <p className="truncate text-sm text-foreground-muted">{d.campaignTitle}</p>
                          </div>
                        </div>
                        <span
                          className={
                            progress.overdue
                              ? "shrink-0 rounded-full bg-highlight px-2.5 py-0.5 text-xs font-medium text-highlight-foreground"
                              : "shrink-0 rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-medium"
                          }
                        >
                          {daysLeftLabel(progress.daysLeft)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                        <span className="text-foreground-muted">You receive</span>
                        <span className="font-medium">{formatCurrency(d.netPayout)}</span>
                      </div>
                      <div>
                        <DotGrid dots={dots} size="sm" label={progress.label} />
                        <p className="mt-2 text-[13px] text-foreground-muted">{progress.label}</p>
                      </div>
                      <Button variant="primary" size="sm" disabled={busyId === d.id} onClick={() => act(d.id, "complete")}>
                        {busyId === d.id ? "…" : "Mark posted"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {offers.length > 0 && (
            <section aria-labelledby="offers-title" className="flex flex-col gap-3">
              <CardTitle id="offers-title" className="text-2xl">
                Offers for you
              </CardTitle>
              {offers.map((o) => (
                <Card key={o.id} tone="raised" padding="sm" className="flex flex-wrap items-center gap-3">
                  <Avatar src={null} alt={o.brandName} fallback={initials(o.brandName)} className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.brandName}</p>
                    <p className="truncate text-sm text-foreground-muted">
                      {o.campaignTitle} · {formatCurrency(o.netPayout)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" disabled={busyId === o.id} onClick={() => act(o.id, "accept")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => act(o.id, "decline")}>
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </section>
          )}

          <section aria-labelledby="briefs-title" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle id="briefs-title" className="text-2xl">
                Open briefs
              </CardTitle>
              {unlocked && openBriefCount > 0 && (
                <Link href="/dashboard/creator/opportunities" className="text-sm font-medium text-accent hover:underline">
                  See all {openBriefCount}
                </Link>
              )}
            </div>
            {!unlocked ? (
              <Card padding="lg" className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-foreground-subtle" strokeWidth={1.5} />
                  <p className="font-medium">Paid briefs open at {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers</p>
                </div>
                <div className="max-w-sm">
                  <ProgressBar value={Math.min(100, (profile.followerCount / MARKETPLACE_FOLLOWER_THRESHOLD) * 100)} />
                  <p className="mt-1 text-[13px] text-foreground-muted">
                    {profile.followerCount.toLocaleString()} / {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers
                  </p>
                </div>
              </Card>
            ) : openBriefs.length === 0 ? (
              <Card padding="lg" className="flex flex-col items-center gap-2 py-10 text-center text-foreground-muted">
                <Briefcase className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
                <p className="font-medium text-foreground">No open briefs right now</p>
                <p className="text-sm">New campaigns from brands appear here.</p>
              </Card>
            ) : (
              openBriefs.map((b) => {
                const info = describeDeadline(b.deadline, today);
                return (
                  <Card key={b.id} padding="sm" className="flex flex-wrap items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{b.title}</p>
                      <p className="truncate text-[13px] text-foreground-muted">
                        {b.brandName}
                        {b.targetVertical ? ` · ${b.targetVertical}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">{formatCurrency(b.budget)}</p>
                      <p className={info.urgency === "soon" ? "text-[13px] font-medium text-highlight" : "text-[13px] text-foreground-muted"}>
                        {info.label}
                        {info.detail ? ` · ${info.detail}` : ""}
                      </p>
                    </div>
                    <Link href="/dashboard/creator/opportunities" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      View
                    </Link>
                  </Card>
                );
              })
            )}
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <GradientStatCard
            value={<NumberFlow value={earnings.totalEarned} format={MONEY} />}
            label={`Earned · ${formatCurrency(earnings.available)} available${earnings.inTransit > 0 ? `, ${formatCurrency(earnings.inTransit)} in transit` : ""}`}
          />
          <Link href="/dashboard/creator/earnings" className={buttonVariants({ variant: "outline" })}>
            Open earnings statement
          </Link>

          <Card padding="lg" className="flex flex-col gap-4">
            <CardHeader className="mb-0">
              <CardTitle className="text-2xl">Your card</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/creators/${card.cardSlug}`)}>
                <SquareArrowOutUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                Open
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                Copy link
              </Button>
              <Button variant="primary" size="sm" onClick={shareCard}>
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Share
              </Button>
            </div>
            <CreatorCardPreview profile={profile} card={card} reach={snapshot?.publicPostReach} />
          </Card>
        </aside>
      </div>
    </>
  );
}

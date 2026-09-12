"use client";

import { Activity, ExternalLink, Eye, FileText, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { StatTile } from "@/components/creator/stat-tile";
import { ReachChart } from "@/components/charts/reach-chart";
import { useCreatorPersona } from "@/hooks/use-creator-persona";
import { formatCompactNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const { analytics } = useCreatorPersona();
  const { snapshot, posts } = analytics;
  const isImporting = snapshot.publicPostsCount === 0;

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Analytics"
        description="Public LinkedIn performance imported for this profile."
      />

      <GlassCard strong className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              PUBLIC LINKEDIN SNAPSHOT
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {isImporting ? "Public LinkedIn posts are being imported" : "Public LinkedIn performance is up to date"}
            </h2>
            <p className="mt-1 max-w-lg text-sm text-foreground-muted">
              {isImporting
                ? "The profile is ready. Post history and reach will appear after the public-data job completes."
                : "Numbers below reflect this profile's most recently collected public posts."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold">{snapshot.pctPostsWithReachData}%</p>
            <p className="text-sm text-foreground-muted">of imported posts include reach data</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs text-foreground-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${isImporting ? "bg-foreground-subtle" : "bg-success"}`} />
              {isImporting ? "No public post found yet" : "Import complete"}
            </span>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
          label="Public posts"
          value={snapshot.publicPostsCount}
          caption="Original LinkedIn posts found"
        />
        <StatTile
          icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
          label="Public post reach"
          value={snapshot.publicPostReach}
          pending={snapshot.publicPostReach === null}
          caption="Waiting for public post data"
        />
        <StatTile
          icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
          label="Public engagements"
          value={snapshot.publicEngagements}
          caption="Reactions, comments and reposts"
        />
        <StatTile
          icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
          label="LinkedIn followers"
          value={snapshot.followerCount}
          pending={snapshot.followerCount === null}
          caption="Imported from the public profile"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Recent LinkedIn posts</h2>
          <p className="mb-4 text-sm text-foreground-muted">Open the original post on LinkedIn.</p>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-foreground-muted">
              <p className="font-medium text-foreground">Public post import in progress</p>
              <p className="max-w-sm text-sm">The first public LinkedIn posts will appear here automatically.</p>
            </div>
          ) : (
            <>
              <ReachChart data={snapshot.reachHistory} />
              <div className="mt-4 flex flex-col divide-y divide-border">
                {posts.map((post) => (
                  <a
                    key={post.id}
                    href={post.originalPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-foreground"
                  >
                    <span className="min-w-0 flex-1 truncate text-foreground-muted">{post.originalPostUrl}</span>
                    <span className="shrink-0 text-foreground-subtle">
                      {post.hasReachData ? `${formatCompactNumber(post.reach ?? 0)} reach` : "No reach data"}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Public profile summary</h2>
          <p className="text-sm text-foreground-muted">Automatically collected from public LinkedIn data.</p>
          {[
            ["LinkedIn followers", snapshot.followerCount],
            ["Public posts", snapshot.publicPostsCount],
            ["Posts with reach data", Math.round((snapshot.pctPostsWithReachData / 100) * snapshot.publicPostsCount)],
            ["Public engagements", snapshot.publicEngagements],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <span className="text-sm text-foreground-muted">{label}</span>
              <span className="font-medium tabular-nums">{value === null ? "—" : formatCompactNumber(Number(value))}</span>
            </div>
          ))}
        </GlassCard>
      </div>

      <GlassCard className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
        <div>
          <p className="font-medium">Public LinkedIn data is being collected</p>
          <p className="text-sm text-foreground-muted">
            Naano is collecting the creator&apos;s recent public posts. No personal LinkedIn connection is required
            for this demo view — the real ingestion pipeline uses manual entry or CSV upload (see the project plan).
          </p>
        </div>
      </GlassCard>
    </>
  );
}

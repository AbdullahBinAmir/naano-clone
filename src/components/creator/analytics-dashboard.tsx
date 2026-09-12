"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, ExternalLink, Eye, FileText, Upload, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { StatTile } from "@/components/creator/stat-tile";
import { ReachChart } from "@/components/charts/reach-chart";
import { Button } from "@/components/ui/button";
import { saveAnalyticsSnapshotAction, uploadPostsCsvAction } from "@/lib/actions/analytics";
import { formatCompactNumber } from "@/lib/utils";
import type { LinkedinAnalyticsSnapshotRow, LinkedinPostRow } from "@/types/database";

export function AnalyticsDashboard({
  followerCount,
  snapshots,
  posts,
}: {
  followerCount: number;
  snapshots: LinkedinAnalyticsSnapshotRow[];
  posts: LinkedinPostRow[];
}) {
  const router = useRouter();
  const latest = snapshots[0] ?? null;

  const [form, setForm] = React.useState({
    followerCount,
    publicPostReach: latest?.public_post_reach ?? 0,
    publicPostsCount: latest?.public_posts_count ?? 0,
    publicEngagements: latest?.public_engagements ?? 0,
    pctPostsWithReachData: latest?.pct_posts_with_reach_data ?? 0,
  });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    const result = await saveAnalyticsSnapshotAction({
      followerCount: form.followerCount,
      publicPostReach: form.publicPostReach,
      publicPostsCount: form.publicPostsCount,
      publicEngagements: form.publicEngagements,
      pctPostsWithReachData: form.pctPostsWithReachData,
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Stats saved");
    router.refresh();
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a CSV file first");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadPostsCsvAction(formData);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Imported ${result.insertedCount} post${result.insertedCount === 1 ? "" : "s"}${result.skippedCount ? ` (${result.skippedCount} skipped)` : ""}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  const chartData = snapshots
    .slice(0, 6)
    .reverse()
    .map((s) => ({
      date: new Date(s.captured_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      reach: s.public_post_reach ?? 0,
      engagements: s.public_engagements,
    }));

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Analytics"
        description="Add your own LinkedIn stats — Naano never scrapes or auto-imports them. Update this whenever your numbers change."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={<FileText className="h-4 w-4" strokeWidth={1.75} />}
          label="Public posts"
          value={latest?.public_posts_count ?? 0}
          caption="From your latest saved snapshot"
        />
        <StatTile
          icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
          label="Public post reach"
          value={latest?.public_post_reach ?? null}
          pending={!latest || latest.public_post_reach === null}
          caption="Add a number below to fill this in"
        />
        <StatTile
          icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
          label="Public engagements"
          value={latest?.public_engagements ?? 0}
          caption="Reactions, comments and reposts"
        />
        <StatTile
          icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
          label="LinkedIn followers"
          value={followerCount}
          caption="Unlocks the Marketplace at 1,000"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard>
          <h2 className="mb-1 text-lg font-semibold">Update your stats</h2>
          <p className="mb-4 text-sm text-foreground-muted">
            Saving creates a new snapshot, so your trend chart builds up over time.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="LinkedIn followers"
              value={form.followerCount}
              onChange={(v) => setForm((f) => ({ ...f, followerCount: v }))}
            />
            <NumberField
              label="Public posts"
              value={form.publicPostsCount}
              onChange={(v) => setForm((f) => ({ ...f, publicPostsCount: v }))}
            />
            <NumberField
              label="Post reach"
              value={form.publicPostReach}
              onChange={(v) => setForm((f) => ({ ...f, publicPostReach: v }))}
            />
            <NumberField
              label="Engagements"
              value={form.publicEngagements}
              onChange={(v) => setForm((f) => ({ ...f, publicEngagements: v }))}
            />
            <NumberField
              label="% posts with reach data"
              value={form.pctPostsWithReachData}
              onChange={(v) => setForm((f) => ({ ...f, pctPostsWithReachData: Math.min(100, v) }))}
              className="col-span-2"
            />
          </div>
          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save snapshot"}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Import posts from a CSV</h2>
          <p className="text-sm text-foreground-muted">
            Columns: <code className="text-foreground">post_url, posted_at, reach, engagements</code> (reach/engagements
            optional per row).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="input file:mr-3 file:rounded-md file:border-0 file:bg-white/[0.08] file:px-3 file:py-1.5 file:text-foreground"
          />
          <Button variant="glass" onClick={handleUpload} disabled={uploading}>
            <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
            {uploading ? "Importing…" : "Import CSV"}
          </Button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Recent LinkedIn posts</h2>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-foreground-muted">
              <p className="font-medium text-foreground">No posts added yet</p>
              <p className="max-w-sm text-sm">Import a CSV above to list your recent public posts here.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={post.original_post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-foreground"
                >
                  <span className="min-w-0 flex-1 truncate text-foreground-muted">{post.original_post_url}</span>
                  <span className="shrink-0 text-foreground-subtle">
                    {post.has_reach_data ? `${formatCompactNumber(post.reach ?? 0)} reach` : "No reach data"}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          )}

          {chartData.length >= 2 ? (
            <div className="mt-4 border-t border-border pt-4">
              <ReachChart data={chartData} />
            </div>
          ) : (
            <p className="mt-4 border-t border-border pt-4 text-sm text-foreground-subtle">
              Save a couple more snapshots over time to see a trend chart here.
            </p>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Public profile summary</h2>
          <p className="text-sm text-foreground-muted">From your most recently saved snapshot.</p>
          {[
            ["LinkedIn followers", followerCount],
            ["Public posts", latest?.public_posts_count ?? 0],
            [
              "Posts with reach data",
              latest ? Math.round((latest.pct_posts_with_reach_data / 100) * latest.public_posts_count) : 0,
            ],
            ["Public engagements", latest?.public_engagements ?? 0],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <span className="text-sm text-foreground-muted">{label}</span>
              <span className="font-medium tabular-nums">{formatCompactNumber(Number(value))}</span>
            </div>
          ))}
        </GlassCard>
      </div>
    </>
  );
}

function NumberField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ""}`}>
      <span className="font-medium text-foreground-muted">{label}</span>
      <input
        type="number"
        min={0}
        className="input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

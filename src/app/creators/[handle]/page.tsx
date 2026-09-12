import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass/glass-card";
import { BookPostButton } from "@/components/creator/book-post-button";
import { getDemoCreatorByHandle } from "@/lib/demo-data";
import { analyticsByCreator, linkedinPostsByCreator } from "@/lib/demo-data/analytics";
import { creatorProfiles } from "@/lib/demo-data/creators";
import { formatCompactNumber, formatCurrency, initials } from "@/lib/utils";

const AUDIENCE_SENIORITY: Record<string, { label: string; pct: number }[]> = {
  alexis: [
    { label: "Manager", pct: 22 },
    { label: "Director", pct: 34 },
    { label: "VP", pct: 26 },
    { label: "C-level", pct: 18 },
  ],
  marcus: [
    { label: "Manager", pct: 38 },
    { label: "Director", pct: 31 },
    { label: "VP", pct: 21 },
    { label: "C-level", pct: 10 },
  ],
  juliette: [
    { label: "IC", pct: 60 },
    { label: "Manager", pct: 28 },
    { label: "Director", pct: 12 },
  ],
};

export default async function PublicCreatorCardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const result = await getDemoCreatorByHandle(handle);
  if (!result) notFound();

  const { profile, card } = result;
  const key = (Object.keys(creatorProfiles) as (keyof typeof creatorProfiles)[]).find(
    (k) => creatorProfiles[k].handle === handle,
  )!;
  const analytics = analyticsByCreator[key];
  const posts = linkedinPostsByCreator[key];
  const seniority = AUDIENCE_SENIORITY[key] ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold text-accent-foreground">
          N
        </span>
        naano
      </Link>

      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent/25 via-surface-2 to-surface-1">
        <Image
          src={card.bannerUrl}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover opacity-70"
        />
      </div>

      <div className="relative -mt-12 flex flex-col gap-6 px-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.displayName}
            fallback={initials(profile.displayName)}
            size="lg"
            className="h-24 w-24 border-4 border-base text-2xl"
          />
          <div>
            <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
            <p className="text-foreground-muted">{profile.headline}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-foreground-subtle">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
              {profile.location}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-2">
        {profile.categoryTags.map((tag) => (
          <Badge key={tag} variant="accent">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <GlassCard>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-foreground-muted">{profile.bio}</p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold">Audience seniority</h2>
            <div className="mt-4 flex flex-col gap-3">
              {seniority.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{s.label}</span>
                    <span className="font-medium">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold">Sample posts</h2>
            {posts.length === 0 ? (
              <p className="mt-2 text-sm text-foreground-muted">No public posts collected yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {posts.map((post) => (
                  <a
                    key={post.id}
                    href={post.originalPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-surface flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm transition-colors hover:text-foreground"
                  >
                    <span className="truncate text-foreground-muted">{new Date(post.postedAt).toLocaleDateString()}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="flex flex-col gap-4">
          <GlassCard strong className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-semibold">{formatCompactNumber(profile.followerCount)}</p>
                <p className="text-xs text-foreground-subtle">Followers</p>
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {analytics.publicPostReach ? formatCompactNumber(analytics.publicPostReach) : "—"}
                </p>
                <p className="text-xs text-foreground-subtle">Reach</p>
              </div>
              <div>
                <p className="text-xl font-semibold">{formatCompactNumber(analytics.publicEngagements)}</p>
                <p className="text-xs text-foreground-subtle">Engagements</p>
              </div>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <p className="text-3xl font-semibold text-accent">{formatCurrency(card.pricePerPost)}</p>
              <p className="text-sm text-foreground-subtle">per sponsored post</p>
            </div>
            <BookPostButton creatorName={profile.displayName} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

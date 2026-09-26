import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookPostButton, type BookingMode } from "@/components/creator/book-post-button";
import { LogCardVisit } from "@/components/creator/log-card-visit";
import { createClient } from "@/lib/supabase/server";
import { rowToCreatorCard, rowToCreatorProfile } from "@/lib/mappers/creator";
import { formatCompactNumber, formatCurrency, initials } from "@/lib/utils";
import type { CreatorCard, CreatorProfile } from "@/types/domain";
import type { LinkedinPostRow } from "@/types/database";

interface ViewModel {
  profile: CreatorProfile;
  card: CreatorCard;
  cardId: string; // creator_cards.id, for visit logging
  publicPostReach: number | null;
  publicEngagements: number;
  posts: { id: string; originalPostUrl: string; postedAt: string }[];
}

async function loadRealCreator(handle: string): Promise<ViewModel | null> {
  const supabase = await createClient();

  const { data: profileRow } = await supabase.from("creator_profiles").select("*").eq("handle", handle).maybeSingle();
  if (!profileRow) return null;

  const { data: cardRow } = await supabase
    .from("creator_cards")
    .select("*")
    .eq("creator_profile_id", profileRow.profile_id)
    .maybeSingle();
  if (!cardRow) return null;

  const [{ data: snapshot }, { data: posts }] = await Promise.all([
    supabase
      .from("linkedin_analytics_snapshots")
      .select("public_post_reach, public_engagements")
      .eq("creator_profile_id", profileRow.profile_id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("linkedin_posts")
      .select("*")
      .eq("creator_profile_id", profileRow.profile_id)
      .order("posted_at", { ascending: false })
      .limit(6),
  ]);

  return {
    profile: rowToCreatorProfile(profileRow),
    card: rowToCreatorCard(cardRow),
    cardId: cardRow.id,
    publicPostReach: snapshot?.public_post_reach ?? null,
    publicEngagements: snapshot?.public_engagements ?? 0,
    posts: ((posts ?? []) as LinkedinPostRow[]).map((p) => ({
      id: p.id,
      originalPostUrl: p.original_post_url,
      postedAt: p.posted_at,
    })),
  };
}

async function resolveBookingMode(handle: string, vm: ViewModel): Promise<BookingMode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "signed-out", signInHref: `/sign-in?next=${encodeURIComponent(`/creators/${handle}`)}` };
  if (user.id === vm.profile.profileId) return { kind: "own" };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "brand") return me ? { kind: "creator" } : { kind: "signed-out", signInHref: "/onboarding" };

  const { data: existing } = await supabase
    .from("collaborations")
    .select("id")
    .is("campaign_id", null)
    .eq("creator_profile_id", vm.profile.profileId)
    .eq("brand_profile_id", user.id)
    .maybeSingle();
  return { kind: "brand", creatorProfileId: vm.profile.profileId, alreadyOffered: !!existing };
}

export default async function PublicCreatorCardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const vm = await loadRealCreator(handle);
  if (!vm) notFound();

  const bookingMode = await resolveBookingMode(handle, vm);
  const { profile, card, cardId, publicPostReach, publicEngagements, posts } = vm;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <LogCardVisit cardId={cardId} />

      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold text-accent-foreground">
          N
        </span>
        naano
      </Link>

      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent/25 via-surface-2 to-surface-1">
        {card.bannerUrl && (
          <Image
            src={card.bannerUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover opacity-70"
          />
        )}
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
            {profile.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-foreground-subtle">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                {profile.location}
              </p>
            )}
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
          <Card>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-foreground-muted">{profile.bio || "This creator hasn't added a bio yet."}</p>
          </Card>

          <Card>
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
                    className="border border-border bg-card-raised flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm transition-colors hover:text-foreground"
                  >
                    <span className="truncate text-foreground-muted">{new Date(post.postedAt).toLocaleDateString()}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card tone="raised" className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-semibold">{formatCompactNumber(profile.followerCount)}</p>
                <p className="text-xs text-foreground-subtle">Followers</p>
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {publicPostReach ? formatCompactNumber(publicPostReach) : "—"}
                </p>
                <p className="text-xs text-foreground-subtle">Reach</p>
              </div>
              <div>
                <p className="text-xl font-semibold">{formatCompactNumber(publicEngagements)}</p>
                <p className="text-xs text-foreground-subtle">Engagements</p>
              </div>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <p className="text-3xl font-semibold text-accent">{formatCurrency(card.pricePerPost)}</p>
              <p className="text-sm text-foreground-subtle">per sponsored post</p>
            </div>
            <BookPostButton creatorName={profile.displayName} pricePerPost={card.pricePerPost} mode={bookingMode} />
          </Card>
        </div>
      </div>
    </div>
  );
}

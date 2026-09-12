"use client";

import * as React from "react";
import { toast } from "sonner";
import { Lock, Share2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { CreatorCardPreview } from "@/components/creator/creator-card-preview";
import { Button } from "@/components/ui/button";
import { useCreatorPersona } from "@/hooks/use-creator-persona";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";
import type { CreatorCard, CreatorProfile } from "@/types/domain";

export default function MyCardPage() {
  const { key, profile, card, unlocked } = useCreatorPersona();
  // Keying on the persona remounts the form (resetting local draft state)
  // whenever the demo-persona switcher changes who's "logged in", instead of
  // syncing state in an effect.
  return <MyCardForm key={key} profile={profile} card={card} unlocked={unlocked} />;
}

function MyCardForm({
  profile,
  card,
  unlocked,
}: {
  profile: CreatorProfile;
  card: CreatorCard;
  unlocked: boolean;
}) {
  const [draftProfile, setDraftProfile] = React.useState<CreatorProfile>(profile);
  const [draftCard, setDraftCard] = React.useState<CreatorCard>(card);

  return (
    <>
      <PageHeader
        eyebrow="Your creator storefront"
        title="Your Naano card, ready to travel."
        description="Share clear proof of your positioning, audience and offers. Every improvement makes the card more useful to brands."
      />

      {!unlocked && (
        <GlassCard className="flex items-center gap-3 border-accent/20">
          <Lock className="h-4 w-4 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
          <div>
            <p className="font-medium">Not visible on the Marketplace yet</p>
            <p className="text-sm text-foreground-muted">
              Your workspace and card remain accessible. Marketplace visibility unlocks when your audience reaches{" "}
              {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers.
            </p>
          </div>
        </GlassCard>
      )}

      <GlassCard className="border-accent/15 bg-accent-muted/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-accent uppercase">Your card is your deal link</p>
            <h3 className="mt-1 text-xl font-semibold">Put it on LinkedIn. Earn when a brand joins through it.</h3>
            <p className="mt-2 max-w-xl text-sm text-foreground-muted">
              Add it as a LinkedIn experience entry, or send it when a brand contacts you directly — Naano attributes
              any resulting deal back to you automatically.
            </p>
          </div>
          <div className="flex shrink-0 gap-6 sm:gap-8">
            <div>
              <p className="text-xs text-foreground-subtle">Your share</p>
              <p className="text-2xl font-semibold text-accent">{draftCard.sharePercent}%</p>
            </div>
            <div>
              <p className="text-xs text-foreground-subtle">Reward period</p>
              <p className="text-2xl font-semibold">{draftCard.rewardWindowMonths} months</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <GlassCard className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold">Edit your card</h2>

          <Field label="Display name">
            <input
              className="input"
              value={draftProfile.displayName}
              onChange={(e) => setDraftProfile((p) => ({ ...p, displayName: e.target.value }))}
            />
          </Field>
          <Field label="Headline">
            <input
              className="input"
              value={draftProfile.headline}
              onChange={(e) => setDraftProfile((p) => ({ ...p, headline: e.target.value }))}
            />
          </Field>
          <Field label="Bio">
            <textarea
              className="input min-h-24 resize-y"
              value={draftProfile.bio}
              onChange={(e) => setDraftProfile((p) => ({ ...p, bio: e.target.value }))}
            />
          </Field>
          <Field label="Category tags (comma separated)">
            <input
              className="input"
              value={draftProfile.categoryTags.join(", ")}
              onChange={(e) =>
                setDraftProfile((p) => ({
                  ...p,
                  categoryTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                }))
              }
            />
          </Field>
          <Field label="Price per post (EUR)">
            <input
              type="number"
              className="input"
              value={draftCard.pricePerPost}
              onChange={(e) => setDraftCard((c) => ({ ...c, pricePerPost: Number(e.target.value) || 0 }))}
            />
          </Field>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-foreground-subtle">
              Changes here are local to this demo session and reset on reload.
            </p>
            <Button variant="primary" onClick={() => toast.success("Card saved")}>
              Save changes
            </Button>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <CreatorCardPreview
            profile={draftProfile}
            card={draftCard}
            footer={
              <Button
                variant="glass"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(`https://naano.com/creators/${draftCard.cardSlug}`);
                  toast.success("Card link copied");
                }}
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Copy or share my card
              </Button>
            }
          />
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground-muted">{label}</span>
      {children}
    </label>
  );
}

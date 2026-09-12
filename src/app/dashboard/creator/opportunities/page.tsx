"use client";

import { toast } from "sonner";
import { Lock, Store } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreatorPersona } from "@/hooks/use-creator-persona";
import { getDemoOpportunitiesSync } from "@/lib/demo-data/opportunities";
import { formatCurrency } from "@/lib/utils";
import { MARKETPLACE_FOLLOWER_THRESHOLD } from "@/lib/constants";

export default function OpportunitiesPage() {
  const { unlocked, profile } = useCreatorPersona();
  const opportunities = getDemoOpportunitiesSync();

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Opportunities"
        description="Open brand campaigns — apply, the brand accepts, and the booking is created on your terms."
      />

      {!unlocked ? (
        <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
          <Lock className="h-8 w-8 text-foreground-subtle" strokeWidth={1.5} />
          <p className="text-lg font-semibold">Paid campaigns open at {MARKETPLACE_FOLLOWER_THRESHOLD.toLocaleString()} followers</p>
          <p className="max-w-md text-sm text-foreground-muted">
            You have {profile.followerCount.toLocaleString()} followers. Keep posting and come back — re-check your
            count once a week from Settings.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {opportunities.map((op) => (
            <GlassCard key={op.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="glass-surface flex h-10 w-10 items-center justify-center rounded-md">
                  <Store className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-semibold">{op.brand?.companyName}</p>
                  <p className="text-xs text-foreground-subtle">{op.targetVertical}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">{op.title}</p>
                <p className="mt-1 text-sm text-foreground-muted">{op.briefText}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Badge variant="accent">{formatCurrency(op.budget)} budget</Badge>
                <Button variant="primary" size="sm" onClick={() => toast.success(`Application sent to ${op.brand?.companyName}`)}>
                  Apply
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Layers, Sparkles, Users2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/creator/stat-tile";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { useBrandPersona } from "@/hooks/use-brand-persona";

export default function BrandOverviewPage() {
  const { profile, campaigns, matchingCreators } = useBrandPersona();
  const router = useRouter();
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);

  return (
    <>
      <PageHeader
        eyebrow="Brand workspace"
        title={`Good to see you, ${profile.companyName}`}
        description="Match with vetted LinkedIn creators, brief in days, track pipeline."
        action={
          <Button variant="primary" onClick={() => router.push("/dashboard/brand/match")}>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Find creators
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Layers className="h-4 w-4" strokeWidth={1.75} />}
          label="Active campaigns"
          value={campaigns.filter((c) => c.status === "published").length}
          caption="Currently open to applications"
        />
        <StatTile
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
          label="Total budget"
          value={totalBudget}
          format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
          caption="Across all campaigns"
        />
        <StatTile
          icon={<Users2 className="h-4 w-4" strokeWidth={1.75} />}
          label="Creators in network"
          value={matchingCreators.length}
          caption="Matching your current filters"
        />
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold">Plan</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          You&apos;re on the <span className="font-medium text-foreground">{profile.planTier === "managed" ? "Managed" : "Self-Serve"}</span> plan.
        </p>
      </GlassCard>
    </>
  );
}

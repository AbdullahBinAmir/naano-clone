"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applyToCampaignAction } from "@/lib/actions/collaborations";
import { formatCurrency } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  briefText: string;
  budget: number;
  targetVertical: string;
  brandName: string;
  brandLogoUrl: string;
}

export function OpportunitiesList({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const [applyingId, setApplyingId] = React.useState<string | null>(null);

  async function handleApply(op: Opportunity) {
    setApplyingId(op.id);
    const result = await applyToCampaignAction({ campaignId: op.id });
    setApplyingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Application sent to ${op.brandName}`);
    router.refresh();
  }

  if (opportunities.length === 0) {
    return (
      <GlassCard className="py-16 text-center text-foreground-muted">
        No open campaigns right now — check back soon, or a brand may reach out to you directly.
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {opportunities.map((op) => (
        <GlassCard key={op.id} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="glass-surface flex h-10 w-10 items-center justify-center rounded-md">
              <Store className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-semibold">{op.brandName}</p>
              <p className="text-xs text-foreground-subtle">{op.targetVertical}</p>
            </div>
          </div>
          <div>
            <p className="font-medium">{op.title}</p>
            <p className="mt-1 text-sm text-foreground-muted">{op.briefText}</p>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Badge variant="accent">{formatCurrency(op.budget)} budget</Badge>
            <Button variant="primary" size="sm" onClick={() => handleApply(op)} disabled={applyingId === op.id}>
              {applyingId === op.id ? "Applying…" : "Apply"}
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

"use client";

import { toast } from "sonner";
import { Store } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { getDemoOpportunitiesSync } from "@/lib/demo-data/opportunities";

export function OpportunitiesList({ opportunities }: { opportunities: ReturnType<typeof getDemoOpportunitiesSync> }) {
  return (
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
  );
}

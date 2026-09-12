"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Store } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applyToCampaignAction } from "@/lib/actions/collaborations";
import { startDirectConversationAction } from "@/lib/actions/messages";
import { formatCurrency } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  briefText: string;
  budget: number;
  targetVertical: string;
  brandName: string;
  brandLogoUrl: string;
  brandProfileId: string;
}

export function OpportunitiesList({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const [applyingId, setApplyingId] = React.useState<string | null>(null);
  const [messagingId, setMessagingId] = React.useState<string | null>(null);

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

  async function handleMessage(op: Opportunity) {
    setMessagingId(op.id);
    const result = await startDirectConversationAction({ otherProfileId: op.brandProfileId });
    setMessagingId(null);

    if (result.error || !result.conversationId) {
      toast.error(result.error ?? "Couldn't start that conversation.");
      return;
    }
    router.push(`/dashboard/creator/messages?conversation=${result.conversationId}`);
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
            <div className="flex gap-1.5">
              <Button
                variant="glass"
                size="sm"
                onClick={() => handleMessage(op)}
                disabled={messagingId === op.id}
                aria-label={`Message ${op.brandName}`}
              >
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleApply(op)} disabled={applyingId === op.id}>
                {applyingId === op.id ? "Applying…" : "Apply"}
              </Button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

"use client";

import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrandPersona } from "@/hooks/use-brand-persona";

const PLANS = [
  { key: "self_serve", name: "Self-Serve", price: "€0/mo + per-post spend", description: "Set your own filters, book directly, pay per post." },
  { key: "managed", name: "Managed", price: "€700/mo", description: "Full-service matching, briefing and campaign management." },
] as const;

export default function BillingPage() {
  const { profile } = useBrandPersona();

  return (
    <>
      <PageHeader eyebrow="Billing" title="Billing" description="Manage your plan and payment method." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <GlassCard key={plan.key} className={plan.key === profile.planTier ? "border-accent/40" : undefined}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.key === profile.planTier && <Badge variant="accent">Current plan</Badge>}
            </div>
            <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
            <p className="mt-2 text-sm text-foreground-muted">{plan.description}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="glass-surface flex h-10 w-10 items-center justify-center rounded-md">
            <CreditCard className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-medium">Payment method</p>
            <p className="text-sm text-foreground-muted">No payment method on file.</p>
          </div>
        </div>
        <Button variant="glass" onClick={() => toast("Payment collection isn't wired up in this demo.")}>
          Add payment method
        </Button>
      </GlassCard>
    </>
  );
}

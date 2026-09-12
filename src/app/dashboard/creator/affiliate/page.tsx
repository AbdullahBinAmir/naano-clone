"use client";

import * as React from "react";
import { toast } from "sonner";
import { Building2, Copy, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCreatorPersona } from "@/hooks/use-creator-persona";

export default function AffiliateProgramPage() {
  const { affiliateReferrals } = useCreatorPersona();
  const brandReferral = affiliateReferrals.find((r) => r.referralType === "invite_brand");
  const creatorReferral = affiliateReferrals.find((r) => r.referralType === "invite_creator");

  return (
    <>
      <PageHeader
        eyebrow="Affiliate program"
        title="Recommend Naano. Earn for 3 months."
        description="Share your personal link. If it converts, you earn a share of Naano's commission for three months."
      />

      <Tabs defaultValue="brands">
        <TabsList className="w-fit">
          <TabsIndicator />
          <TabsTab value="brands">
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Invite brands
          </TabsTab>
          <TabsTab value="creators">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Invite creators
          </TabsTab>
        </TabsList>

        <TabsPanel value="brands" className="mt-6">
          <ReferralPanel
            code={brandReferral?.referralCode ?? ""}
            sharePercent={brandReferral?.sharePercent ?? 25}
            windowMonths={brandReferral?.rewardWindowMonths ?? 3}
            headline="Recommend Naano. Earn for 3 months."
            description="Share your personal link with a company. If it joins Naano and launches paid campaigns, you receive 25% of Naano's commission for three months."
            linkLabel="Copy my referral link"
            pathSegment="invite/brand"
          />
        </TabsPanel>

        <TabsPanel value="creators" className="mt-6">
          <ReferralPanel
            code={creatorReferral?.referralCode ?? ""}
            sharePercent={creatorReferral?.sharePercent ?? 25}
            windowMonths={creatorReferral?.rewardWindowMonths ?? 3}
            headline="Invite great creators. Earn when they do."
            description="When a creator you invite completes their first paid collaboration, you earn 25% of Naano's commission on their collaborations for three months. The window starts at their first completed paid collaboration — never at signup."
            linkLabel="Copy my creator invite link"
            pathSegment="invite/creator"
          />
        </TabsPanel>
      </Tabs>
    </>
  );
}

function ReferralPanel({
  code,
  sharePercent,
  windowMonths,
  headline,
  description,
  linkLabel,
  pathSegment,
}: {
  code: string;
  sharePercent: number;
  windowMonths: number;
  headline: string;
  description: string;
  linkLabel: string;
  pathSegment: string;
}) {
  const link = `naano.com/${pathSegment}/${code}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">{headline}</h2>
        <p className="mt-4 max-w-xl text-foreground-muted">{description}</p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => {
            navigator.clipboard.writeText(`https://${link}`);
            toast.success("Referral link copied");
          }}
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          {linkLabel}
        </Button>
      </div>

      <GlassCard strong className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-foreground-subtle uppercase">Your invite link</p>
          <p className="mt-1 text-sm text-foreground-muted">Every signup is attributed automatically</p>
        </div>
        <div className="glass-surface flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-accent">
          {link}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://${link}`);
              toast.success("Link copied");
            }}
            className="text-foreground-subtle hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-surface rounded-lg p-3">
            <p className="text-xs text-foreground-subtle">Your share</p>
            <p className="text-xl font-semibold">{sharePercent}%</p>
          </div>
          <div className="glass-surface rounded-lg p-3">
            <p className="text-xs text-foreground-subtle">Reward window</p>
            <p className="text-xl font-semibold">{windowMonths} months</p>
          </div>
        </div>
        <p className="text-xs text-foreground-subtle">
          The window starts with their first completed paid collaboration — never at signup.
        </p>
      </GlassCard>
    </div>
  );
}

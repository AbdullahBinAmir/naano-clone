"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { OpportunityCard } from "@/components/creator/opportunity-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createCampaignAction, updateCampaignStatusAction } from "@/lib/actions/campaigns";
import { cn, formatCurrency } from "@/lib/utils";
import type { Campaign, CampaignStatus } from "@/types/domain";

const STATUS_VARIANT: Record<CampaignStatus, "neutral" | "accent" | "danger"> = {
  draft: "neutral",
  published: "accent",
  closed: "danger",
};

const BRIEF_MAX = 2000;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground-muted">{label}</span>
      {children}
      {hint && <span className="text-[13px] text-foreground-subtle">{hint}</span>}
    </label>
  );
}

export function BriefsWorkspace({ brandName, campaigns, today }: { brandName: string; campaigns: Campaign[]; today: string }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [brief, setBrief] = React.useState("");
  const [targetVertical, setTargetVertical] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;
  const preview = selected
    ? {
        title: selected.title,
        briefText: selected.briefText,
        targetVertical: selected.targetVertical,
        budget: selected.budget,
        deadline: selected.deadline ?? null,
      }
    : { title, briefText: brief, targetVertical, budget: Number(budget) || 0, deadline: deadline || null };

  async function handleSave() {
    setSaving(true);
    const result = await createCampaignAction({
      title,
      briefText: brief,
      targetVertical,
      budget: Number(budget) || 0,
      deadline: deadline || null,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Brief saved as a draft");
    setTitle("");
    setBrief("");
    setTargetVertical("");
    setBudget("");
    setDeadline("");
    router.refresh();
  }

  async function setStatus(campaignId: string, status: CampaignStatus) {
    setPendingId(campaignId);
    const result = await updateCampaignStatusAction({ campaignId, status });
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(status === "published" ? "Brief published — creators can now apply" : "Brief closed");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Briefs"
        title="Briefs"
        description="Give creators the context to write in their own voice — vague briefs get vague posts."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card padding="lg" className={cn(selected && "opacity-60")}>
          <CardHeader>
            <CardTitle className="text-2xl">New brief</CardTitle>
            {selected && (
              <Button size="sm" variant="outline" onClick={() => setSelectedId(null)}>
                Back to composer
              </Button>
            )}
          </CardHeader>
          <div className="flex flex-col gap-4">
            <Field label="Campaign title">
              <input className="input" maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Outbound playbook launch" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target vertical">
                <input
                  className="input"
                  maxLength={200}
                  value={targetVertical}
                  onChange={(e) => setTargetVertical(e.target.value)}
                  placeholder="B2B SaaS, RevOps"
                />
              </Field>
              <Field label="Budget (EUR)">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="3200"
                />
              </Field>
            </div>
            <Field label="Apply by (optional)" hint="Creators see this next to the budget. Leave empty for an open-ended brief.">
              <input type="date" min={today} className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
            <Field label="What should the creator cover?" hint={`${brief.length} / ${BRIEF_MAX}`}>
              <textarea
                className="input min-h-36"
                maxLength={BRIEF_MAX}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Share how your audience thinks about… Native voice, no script."
              />
            </Field>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-[13px] text-foreground-muted">Saves as a draft — publish it below when you&apos;re ready.</p>
              <Button variant="primary" onClick={handleSave} disabled={saving || !title.trim() || !!selected}>
                {saving ? "Saving…" : "Save draft"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3 xl:sticky xl:top-28 xl:self-start">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
            <Eye className="h-4 w-4" strokeWidth={1.75} />
            {selected ? `Previewing “${selected.title}”` : "Live preview — how creators see this on Opportunities"}
          </div>
          <OpportunityCard
            brandName={brandName}
            targetVertical={preview.targetVertical}
            title={preview.title}
            briefText={preview.briefText}
            budget={preview.budget}
            deadline={preview.deadline}
            today={today}
            actions={
              <div className="pointer-events-none flex gap-1.5" aria-hidden="true">
                <Button variant="outline" size="sm" tabIndex={-1}>
                  Message
                </Button>
                <Button variant="primary" size="sm" tabIndex={-1}>
                  Apply
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <section aria-labelledby="your-briefs" className="flex flex-col gap-3">
        <h2 id="your-briefs" className="text-2xl font-medium">
          Your briefs
        </h2>
        {campaigns.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-12 text-center text-foreground-muted">
            <FileText className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
            <p className="font-medium text-foreground">No briefs yet</p>
            <p className="text-sm">Write your first one above — the preview shows exactly what creators will see.</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {campaigns.map((c) => {
              const busy = pendingId === c.id;
              const active = c.id === selectedId;
              return (
                <Card key={c.id} tone={active ? "raised" : "default"} padding="sm" className={cn("flex flex-col gap-3", active && "ring-1 ring-accent")}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(active ? null : c.id)}
                    aria-pressed={active}
                    className="flex flex-col gap-1 rounded-md text-left focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{c.title}</span>
                      <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                    </span>
                    <span className="line-clamp-2 text-sm text-foreground-muted">{c.briefText || "No brief text"}</span>
                  </button>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-foreground-muted">
                      {formatCurrency(c.budget)} · {c.targetVertical || "No vertical"}
                    </span>
                    {c.status === "draft" && (
                      <Button size="sm" variant="primary" disabled={busy} onClick={() => setStatus(c.id, "published")}>
                        {busy ? "…" : "Publish"}
                      </Button>
                    )}
                    {c.status === "published" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus(c.id, "closed")}>
                        {busy ? "…" : "Close"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

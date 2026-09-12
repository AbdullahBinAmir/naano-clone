"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCampaignAction } from "@/lib/actions/campaigns";
import type { Campaign } from "@/types/domain";

export function BriefsList({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [brief, setBrief] = React.useState("");
  const [targetVertical, setTargetVertical] = React.useState("");
  const [budget, setBudget] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await createCampaignAction({ title, briefText: brief, targetVertical, budget });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Brief saved as a draft");
    setTitle("");
    setBrief("");
    setTargetVertical("");
    setBudget(0);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Briefs"
        title="Briefs"
        description="Give creators the context to write in their own voice — vague briefs get vague posts."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="primary">
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  New brief
                </Button>
              }
            />
            <DialogContent>
              <DialogTitle>New brief</DialogTitle>
              <DialogDescription>Saves as a draft — publish it from Campaigns once you&apos;re ready.</DialogDescription>
              <div className="mt-4 flex flex-col gap-3">
                <input className="input" placeholder="Campaign title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input
                  className="input"
                  placeholder="Target vertical (e.g. B2B SaaS, RevOps)"
                  value={targetVertical}
                  onChange={(e) => setTargetVertical(e.target.value)}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="Budget (EUR)"
                  value={budget || ""}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                />
                <textarea
                  className="input min-h-24"
                  placeholder="What should the creator cover?"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                <Button variant="primary" onClick={handleSave} disabled={saving || !title.trim()}>
                  {saving ? "Saving…" : "Save draft"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-3">
        {campaigns.length === 0 && (
          <GlassCard className="py-12 text-center text-foreground-muted">No briefs yet — create your first one above.</GlassCard>
        )}
        {campaigns.map((c) => (
          <GlassCard key={c.id} className="flex items-start gap-4">
            <span className="glass-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
              <FileText className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{c.title}</p>
                <Badge variant={c.status === "published" ? "accent" : c.status === "draft" ? "neutral" : "danger"}>
                  {c.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-foreground-muted">{c.briefText}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}

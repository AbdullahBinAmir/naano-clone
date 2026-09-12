"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBrandPersona } from "@/hooks/use-brand-persona";

export default function BriefsPage() {
  const { campaigns } = useBrandPersona();
  const [title, setTitle] = React.useState("");
  const [brief, setBrief] = React.useState("");

  return (
    <>
      <PageHeader
        eyebrow="Briefs"
        title="Briefs"
        description="Give creators the context to write in their own voice — vague briefs get vague posts."
        action={
          <Dialog>
            <DialogTrigger render={<Button variant="primary"><Plus className="h-3.5 w-3.5" strokeWidth={1.75} />New brief</Button>} />
            <DialogContent>
              <DialogTitle>New brief</DialogTitle>
              <DialogDescription>This demo doesn&apos;t persist new briefs yet — Phase 2 wires real campaign creation.</DialogDescription>
              <div className="mt-4 flex flex-col gap-3">
                <input className="input" placeholder="Campaign title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea className="input min-h-24" placeholder="What should the creator cover?" value={brief} onChange={(e) => setBrief(e.target.value)} />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                <DialogClose
                  render={
                    <Button
                      variant="primary"
                      onClick={() => {
                        toast.success("Brief drafted (not saved in this demo)");
                        setTitle("");
                        setBrief("");
                      }}
                    >
                      Save draft
                    </Button>
                  }
                />
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-3">
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

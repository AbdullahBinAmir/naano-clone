"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { openDisputeAction } from "@/lib/actions/collaborations";

/** Lets either party flag a problem on a paid deal; a Naano admin then decides whether to pay out or refund. */
export function DisputeDialog({
  collaborationId,
  open,
  onOpenChange,
  onOpened,
}: {
  collaborationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpened: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    if (!collaborationId) return;
    setPending(true);
    const result = await openDisputeAction({ collaborationId, reason });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Dispute opened — the Naano team will review it");
    setReason("");
    onOpenChange(false);
    onOpened();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Open a dispute</DialogTitle>
        <DialogDescription className="mt-2">
          Use this if the two of you can&apos;t sort a problem out. Payment is frozen while a Naano admin reviews it, then either
          released to the creator or refunded to the brand.
        </DialogDescription>
        <label className="mt-4 flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground-muted">What went wrong?</span>
          <textarea
            className="input min-h-28"
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the problem and what you'd like to happen (at least 10 characters)."
          />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button variant="danger" onClick={submit} disabled={pending || reason.trim().length < 10}>
            {pending ? "Opening…" : "Open dispute"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

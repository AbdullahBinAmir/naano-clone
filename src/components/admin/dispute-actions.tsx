"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { resolveDisputeAction } from "@/lib/actions/admin";

export function DisputeActions({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"release" | "refund" | null>(null);
  const [note, setNote] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit() {
    if (!mode) return;
    setBusy(true);
    const result = await resolveDisputeAction({ disputeId, resolution: mode, note, refundReference: reference });
    setBusy(false);
    if (result.error) return void toast.error(result.error);
    toast.success(mode === "release" ? "Payout released to the creator" : "Refund recorded");
    setMode(null);
    setNote("");
    setReference("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="primary" onClick={() => setMode("release")}>
        Pay the creator
      </Button>
      <Button size="sm" variant="outline" onClick={() => setMode("refund")}>
        Refund the brand
      </Button>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogTitle>{mode === "release" ? "Release the payout to the creator?" : "Refund the brand?"}</DialogTitle>
          <DialogDescription className="mt-2">
            {mode === "release"
              ? "The deal completes and the creator's payout is added to their available balance."
              : "This records the refund. Return the money from the Safepay dashboard first, then enter its reference here."}
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-4">
            {mode === "refund" && (
              <TextField label="Safepay refund reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} />
            )}
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Decision note (optional)</span>
              <textarea className="input min-h-20" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant={mode === "refund" ? "danger" : "primary"} disabled={busy} onClick={submit}>
              {busy ? "Saving…" : mode === "release" ? "Release payout" : "Record refund"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

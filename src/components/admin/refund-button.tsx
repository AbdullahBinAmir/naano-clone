"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { refundCollaborationAction } from "@/lib/actions/admin";

export function RefundButton({ collaborationId }: { collaborationId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit() {
    setBusy(true);
    const result = await refundCollaborationAction({ collaborationId, note, refundReference: reference });
    setBusy(false);
    if (result.error) return void toast.error(result.error);
    toast.success("Refund recorded");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Refund
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Refund this deal?</DialogTitle>
          <DialogDescription className="mt-2">
            Records a refund and closes the deal. Return the money from the Safepay dashboard first, then enter its reference.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-4">
            <TextField label="Safepay refund reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} />
            <TextField label="Note shown on the deal (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant="danger" disabled={busy} onClick={submit}>
              {busy ? "Saving…" : "Record refund"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { setPayoutStatusAction } from "@/lib/actions/admin";
import { formatCurrency } from "@/lib/utils";

type Mode = "paid" | "failed" | null;

export function PayoutActions({ id, status, amount, currency }: { id: string; status: string; amount: number; currency: string }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>(null);
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  if (status === "paid" || status === "failed") return null;

  async function run(next: "processing" | "paid" | "failed", reference = "", note = "") {
    setBusy(true);
    const result = await setPayoutStatusAction({ requestId: id, status: next, reference, note });
    setBusy(false);
    if (result.error) return void toast.error(result.error);
    toast.success(next === "processing" ? "Marked as processing" : next === "paid" ? "Marked as paid" : "Marked as failed — returned to the creator");
    setMode(null);
    setValue("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {status === "requested" && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run("processing")}>
          Start processing
        </Button>
      )}
      <Button size="sm" variant="primary" disabled={busy} onClick={() => setMode("paid")}>
        Mark paid
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode("failed")}>
        Failed
      </Button>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogTitle>{mode === "paid" ? "Confirm the transfer was sent" : "Mark this payout as failed"}</DialogTitle>
          <DialogDescription className="mt-2">
            {mode === "paid"
              ? `Send ${formatCurrency(amount, currency)} to the account shown, then enter the bank transfer reference.`
              : `The ${formatCurrency(amount, currency)} goes back to the creator's available balance and they're told why.`}
          </DialogDescription>
          <div className="mt-4">
            <TextField
              label={mode === "paid" ? "Bank transfer reference" : "Reason"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === "paid" ? "e.g. TXN-20260926-118" : "e.g. Account number was rejected by the bank"}
            />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button
              variant={mode === "paid" ? "primary" : "danger"}
              disabled={busy || !value.trim()}
              onClick={() => (mode === "paid" ? run("paid", value) : run("failed", "", value))}
            >
              {busy ? "Saving…" : mode === "paid" ? "Confirm paid" : "Mark failed"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

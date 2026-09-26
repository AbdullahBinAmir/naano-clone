"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { inviteCreatorAction } from "@/lib/actions/collaborations";
import { formatCurrency } from "@/lib/utils";

export type BookingMode =
  | { kind: "signed-out"; signInHref: string }
  | { kind: "brand"; creatorProfileId: string; alreadyOffered: boolean }
  | { kind: "own" }
  | { kind: "creator" };

const big = "w-full";

export function BookPostButton({
  creatorName,
  pricePerPost,
  mode,
}: {
  creatorName: string;
  pricePerPost: number;
  mode: BookingMode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [offered, setOffered] = React.useState(mode.kind === "brand" && mode.alreadyOffered);

  if (mode.kind === "signed-out") {
    return (
      <Link href={mode.signInHref} className={buttonVariants({ variant: "primary", size: "lg", className: big })}>
        Sign in to book a post
      </Link>
    );
  }
  if (mode.kind === "own") {
    return (
      <Link href="/dashboard/creator/card" className={buttonVariants({ variant: "outline", size: "lg", className: big })}>
        Edit your card
      </Link>
    );
  }
  if (mode.kind === "creator") {
    return <p className="text-center text-sm text-foreground-muted">Only brands can book posts.</p>;
  }

  if (offered) {
    return (
      <Link href="/dashboard/brand/collaborations" className={buttonVariants({ variant: "outline", size: "lg", className: big })}>
        Offer sent — view collaborations
      </Link>
    );
  }

  async function send() {
    if (mode.kind !== "brand") return;
    setPending(true);
    const result = await inviteCreatorAction({ creatorProfileId: mode.creatorProfileId, agreedPrice: pricePerPost });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOffered(true);
    setOpen(false);
    toast.success(`Offer sent to ${creatorName}`);
  }

  return (
    <>
      <Button variant="primary" size="lg" className={big} onClick={() => setOpen(true)}>
        Book a post
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Book a post with {creatorName}</DialogTitle>
          <DialogDescription className="mt-2">
            We&apos;ll send {creatorName} an offer for one sponsored post at their listed price. They can accept or decline,
            and you can chat in Messages once it&apos;s sent.
          </DialogDescription>
          <div className="mt-5 flex items-baseline justify-between rounded-md border border-border bg-card px-4 py-3">
            <span className="text-sm text-foreground-muted">Price per post</span>
            <span className="text-xl font-semibold">{formatCurrency(pricePerPost)}</span>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant="primary" onClick={send} disabled={pending}>
              {pending ? "Sending…" : "Send offer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

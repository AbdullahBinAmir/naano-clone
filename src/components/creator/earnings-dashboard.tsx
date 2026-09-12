"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import NumberFlow from "@number-flow/react";
import { toast } from "sonner";
import { ArrowRightLeft, Banknote, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { EarningsChart } from "@/components/charts/earnings-chart";
import { savePayoutMethodAction, withdrawEarningsAction } from "@/lib/actions/earnings";
import { formatCurrency } from "@/lib/utils";
import type { EarningsSummary } from "@/lib/earnings/get-earnings-summary";

export function EarningsDashboard({ entries, payoutMethods, monthly, totals }: EarningsSummary) {
  const router = useRouter();
  const [payoutMethod, setPayoutMethod] = React.useState<"bank_transfer" | "stripe_connect">("bank_transfer");
  const [amount, setAmount] = React.useState("");
  const [withdrawing, setWithdrawing] = React.useState(false);
  const [editingBank, setEditingBank] = React.useState(false);
  const [savingBank, setSavingBank] = React.useState(false);
  const [bankHolder, setBankHolder] = React.useState("");
  const [bankLastFour, setBankLastFour] = React.useState("");
  const bankMethod = payoutMethods.find((m) => m.method_type === "bank_transfer");

  async function handleWithdraw() {
    setWithdrawing(true);
    const result = await withdrawEarningsAction({ amount: Number(amount) || totals.available });
    setWithdrawing(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Withdrawal complete");
    setAmount("");
    router.refresh();
  }

  async function handleSaveBank(e: React.FormEvent) {
    e.preventDefault();
    setSavingBank(true);
    const result = await savePayoutMethodAction({ bankAccountHolder: bankHolder, bankLastFour });
    setSavingBank(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Bank details saved");
    setEditingBank(false);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Earnings"
        title="Earnings"
        description="Track revenue from your paid collaborations and withdraw available funds."
        action={<Badge variant="accent">Paid collaborations</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground-subtle uppercase">
            <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
            Total earned
          </div>
          <p className="text-3xl font-semibold">
            <NumberFlow value={totals.totalEarned} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} />
          </p>
          <p className="text-sm text-foreground-muted">
            {totals.paidCollaborations} paid collaborations ·{" "}
            {formatCurrency(totals.paidCollaborations ? totals.totalEarned / totals.paidCollaborations : 0)} average
          </p>
        </GlassCard>
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground-subtle uppercase">
            <ArrowRightLeft className="h-4 w-4" strokeWidth={1.75} />
            In transit
          </div>
          <p className="text-3xl font-semibold">
            <NumberFlow value={totals.inTransit} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} />
          </p>
          <p className="text-sm text-foreground-muted">
            Simulated settlement — moves to Available shortly after a collaboration is marked posted.
          </p>
        </GlassCard>
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground-subtle uppercase">
            <Wallet className="h-4 w-4" strokeWidth={1.75} />
            Available now
          </div>
          <p className="text-3xl font-semibold">
            <NumberFlow value={totals.available} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} />
          </p>
          <p className="text-sm text-foreground-muted">Ready to withdraw to your selected payout method.</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Earnings over time</h2>
            <span className="text-sm text-foreground-muted">
              {formatCurrency(monthly.reduce((a, m) => a + m.amount, 0))} over 6 months
            </span>
          </div>
          <p className="mb-2 text-sm text-foreground-muted">Net collaboration earnings from the last six months.</p>
          <EarningsChart data={monthly} />
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Withdraw earnings</h2>
          <p className="text-sm text-foreground-muted">Choose where your available balance should be sent.</p>
          <p className="text-xs font-medium tracking-wide text-foreground-subtle uppercase">Payout method</p>

          <div
            role="radio"
            aria-checked={payoutMethod === "bank_transfer"}
            tabIndex={0}
            onClick={() => setPayoutMethod("bank_transfer")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPayoutMethod("bank_transfer")}
            className={`glass-surface flex cursor-pointer items-start gap-3 rounded-lg p-4 text-left transition-colors ${payoutMethod === "bank_transfer" ? "border-accent/50" : ""}`}
          >
            <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${payoutMethod === "bank_transfer" ? "border-accent bg-accent" : "border-border-strong"}`} />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-medium">
                <Banknote className="h-4 w-4" strokeWidth={1.75} />
                Bank transfer
              </span>
              <span className="mt-1 block text-sm text-foreground-muted">
                {bankMethod?.bank_last_four
                  ? `${bankMethod.bank_account_holder} · account ending ${bankMethod.bank_last_four}`
                  : "No account holder on file · No bank details on file"}
              </span>
              <Dialog
                open={editingBank}
                onOpenChange={(open) => {
                  setEditingBank(open);
                  if (open) {
                    setBankHolder(bankMethod?.bank_account_holder ?? "");
                    setBankLastFour(bankMethod?.bank_last_four ?? "");
                  }
                }}
              >
                <DialogTrigger
                  render={
                    <Button variant="glass" size="sm" className="mt-2" onClick={(e) => e.stopPropagation()}>
                      Edit
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogTitle>Bank transfer details</DialogTitle>
                  <DialogDescription>
                    Only the account holder name and last 4 digits are stored — never a full account number.
                  </DialogDescription>
                  <form onSubmit={handleSaveBank} className="mt-4 flex flex-col gap-3">
                    <input
                      className="input"
                      placeholder="Account holder name"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      required
                    />
                    <input
                      className="input"
                      placeholder="Last 4 digits"
                      value={bankLastFour}
                      onChange={(e) => setBankLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      maxLength={4}
                      required
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <DialogClose render={<Button type="button" variant="ghost">Cancel</Button>} />
                      <Button type="submit" variant="primary" disabled={savingBank}>
                        {savingBank ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </span>
          </div>

          <div
            role="radio"
            aria-checked={payoutMethod === "stripe_connect"}
            tabIndex={0}
            onClick={() => setPayoutMethod("stripe_connect")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPayoutMethod("stripe_connect")}
            className={`glass-surface flex cursor-pointer items-start gap-3 rounded-lg p-4 text-left transition-colors ${payoutMethod === "stripe_connect" ? "border-accent/50" : ""}`}
          >
            <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${payoutMethod === "stripe_connect" ? "border-accent bg-accent" : "border-border-strong"}`} />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-medium">
                <CreditCard className="h-4 w-4" strokeWidth={1.75} />
                Stripe
              </span>
              <span className="mt-1 block text-sm text-foreground-muted">
                Status: Not offered · Naano keeps a simulated balance rather than moving real money via Stripe.
              </span>
              <Button variant="glass" size="sm" className="mt-2" disabled>
                Connect Stripe
              </Button>
            </span>
          </div>

          <div className="flex gap-2 border-t border-border pt-4">
            <input
              className="input"
              placeholder="Amount (EUR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
            />
            <Button variant="outline" onClick={() => setAmount(String(totals.available))}>
              Withdraw all
            </Button>
          </div>

          <Dialog>
            <DialogTrigger
              render={
                <Button variant="primary" className="w-full" disabled={totals.available === 0 || withdrawing}>
                  Confirm withdrawal
                </Button>
              }
            />
            <DialogContent>
              <DialogTitle>Confirm withdrawal</DialogTitle>
              <DialogDescription>
                {formatCurrency(Number(amount) || totals.available)} will move from your available balance to{" "}
                {payoutMethod === "bank_transfer" ? "your bank account" : "Stripe"}. This is a simulated ledger entry —
                no real money moves in this demo.
              </DialogDescription>
              <div className="mt-5 flex justify-end gap-2">
                <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                <DialogClose render={<Button variant="primary" onClick={handleWithdraw}>Confirm</Button>} />
              </div>
            </DialogContent>
          </Dialog>
        </GlassCard>
      </div>

      {entries.length === 0 && (
        <p className="text-center text-sm text-foreground-muted">
          No earnings yet — completed collaborations appear here once a brand&apos;s booking is marked as posted.
        </p>
      )}
    </>
  );
}

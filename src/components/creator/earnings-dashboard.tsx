"use client";

import { CURRENCY } from "@/lib/constants";
import * as React from "react";
import { useRouter } from "next/navigation";
import NumberFlow from "@number-flow/react";
import { toast } from "sonner";
import { Banknote, Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TestModeNotice } from "@/components/ui/test-mode-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { GradientStatCard } from "@/components/ui/gradient-stat-card";
import { EarningsChart } from "@/components/charts/earnings-chart";
import { requestPayoutAction, savePayoutMethodAction } from "@/lib/actions/earnings";
import { cn, formatCurrency } from "@/lib/utils";
import type { EarningsSummary, StatementLine } from "@/lib/earnings/get-earnings-summary";
import type { EarningsStatus, PayoutRequestRow, PayoutRequestStatus } from "@/types/database";

const MONEY = { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 } as const;

const STATUS_META: Record<EarningsStatus, { label: string; variant: "neutral" | "warning" | "success" }> = {
  pending: { label: "Pending", variant: "neutral" },
  in_transit: { label: "In transit", variant: "warning" },
  available: { label: "Available", variant: "success" },
  withdrawn: { label: "Withdrawn", variant: "neutral" },
};

type Filter = "all" | EarningsStatus;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_transit", label: "In transit" },
  { id: "available", label: "Available" },
  { id: "withdrawn", label: "Withdrawn" },
];

function monthKey(iso: string) {
  return iso.slice(0, 7);
}
function monthLabel(key: string) {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function Statement({ lines }: { lines: StatementLine[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const shown = React.useMemo(() => lines.filter((l) => filter === "all" || l.status === filter), [lines, filter]);
  const total = shown.reduce((acc, l) => acc + l.amount, 0);

  const months = React.useMemo(() => {
    const groups = new Map<string, StatementLine[]>();
    for (const l of shown) {
      const k = monthKey(l.date);
      groups.set(k, [...(groups.get(k) ?? []), l]);
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [shown]);

  return (
    <Card padding="lg">
      <CardHeader className="flex-wrap">
        <CardTitle className="text-2xl">Statement</CardTitle>
        <div role="group" aria-label="Filter statement" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
                filter === f.id ? "bg-accent-soft text-accent-soft-foreground" : "bg-card-raised text-foreground-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-foreground-muted">
          <Receipt className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
          <p className="font-medium text-foreground">{lines.length === 0 ? "No earnings yet" : "Nothing in this view"}</p>
          <p className="max-w-sm text-sm">
            {lines.length === 0
              ? "Completed collaborations are credited here once you mark them posted."
              : "Try another filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-foreground-subtle uppercase">
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Description</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            {months.map(([key, rows]) => (
              <tbody key={key}>
                <tr>
                  <th colSpan={3} scope="colgroup" className="pt-5 pb-2 text-left text-[13px] font-medium text-foreground-muted">
                    {monthLabel(key)}
                  </th>
                  <td className="pt-5 pb-2 text-right text-[13px] font-medium text-foreground-muted tabular-nums">
                    {formatCurrency(rows.reduce((a, r) => a + r.amount, 0))}
                  </td>
                </tr>
                {rows.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="py-3 pr-4 whitespace-nowrap text-foreground-muted">
                      {new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{l.description}</p>
                      <p className="text-[13px] text-foreground-muted">
                        {l.type === "collaboration_payout" ? "Collaboration payout" : l.type === "affiliate_reward" ? "Affiliate reward" : "Referral bonus"}
                        {l.counterparty ? ` · ${l.counterparty}` : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={STATUS_META[l.status].variant}>{STATUS_META[l.status].label}</Badge>
                    </td>
                    <td className="py-3 text-right font-medium tabular-nums">{formatCurrency(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            ))}
            <tfoot>
              <tr className="border-t border-border-strong">
                <th colSpan={3} scope="row" className="pt-4 text-left font-medium">
                  Total ({shown.length} {shown.length === 1 ? "entry" : "entries"})
                </th>
                <td className="pt-4 text-right text-lg font-semibold tabular-nums">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}

const PAYOUT_META: Record<PayoutRequestStatus, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
  requested: { label: "Requested", variant: "warning" },
  processing: { label: "Processing", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed — returned", variant: "danger" },
};

function PayoutRequests({ requests }: { requests: PayoutRequestRow[] }) {
  return (
    <Card padding="lg">
      <CardHeader className="mb-2">
        <CardTitle className="text-2xl">Payout requests</CardTitle>
      </CardHeader>
      {requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground-muted">
          No payouts yet. Request one from your available balance and the Naano team will send it to your bank.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div>
                <p className="font-medium">{formatCurrency(Number(r.amount), r.currency)}</p>
                <p className="text-[13px] text-foreground-muted">
                  Requested {new Date(r.requested_at).toLocaleDateString()} · {r.bank_name} ····{r.account_number.slice(-4)}
                </p>
                {r.status === "paid" && r.reference && (
                  <p className="text-[13px] text-foreground-muted">Bank reference: {r.reference}</p>
                )}
                {r.status === "failed" && r.admin_note && <p className="text-[13px] text-danger">{r.admin_note}</p>}
              </div>
              <Badge variant={PAYOUT_META[r.status].variant}>{PAYOUT_META[r.status].label}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function EarningsDashboard({ statement, payoutMethods, payoutRequests, minPayout, monthly, totals }: EarningsSummary) {
  const router = useRouter();
  const [amount, setAmount] = React.useState("");
  const [withdrawing, setWithdrawing] = React.useState(false);
  const [editingBank, setEditingBank] = React.useState(false);
  const [savingBank, setSavingBank] = React.useState(false);
  const [bankHolder, setBankHolder] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const bankMethod = payoutMethods.find((m) => m.method_type === "bank_transfer");

  async function handleWithdraw() {
    setWithdrawing(true);
    const result = await requestPayoutAction({ amount: Number(amount) || totals.available });
    setWithdrawing(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payout requested — the Naano team will send it to your bank");
    setAmount("");
    router.refresh();
  }

  async function handleSaveBank(e: React.FormEvent) {
    e.preventDefault();
    setSavingBank(true);
    const result = await savePayoutMethodAction({ bankAccountHolder: bankHolder, bankName, accountNumber });
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
        description="Every payout from your collaborations, and what you can withdraw."
      />

      <TestModeNotice>
        Payouts are sent by the Naano team to your bank account, usually within a few business days. Brand payments in this
        build run in Safepay&apos;s sandbox.
      </TestModeNotice>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <p className="text-[13px] text-foreground-muted">Total earned</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                <NumberFlow value={totals.totalEarned} format={MONEY} />
              </p>
              <p className="mt-2 text-[13px] text-foreground-muted">
                {totals.paidCollaborations} paid {totals.paidCollaborations === 1 ? "collaboration" : "collaborations"}
                {totals.paidCollaborations > 0 &&
                  ` · ${formatCurrency(totals.totalEarned / totals.paidCollaborations)} average`}
              </p>
            </Card>
            <Card padding="lg">
              <p className="text-[13px] text-foreground-muted">In transit</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                <NumberFlow value={totals.inTransit} format={MONEY} />
              </p>
              <p className="mt-2 text-[13px] text-foreground-muted">
                Moves to Available shortly after a collaboration is marked posted (simulated settlement).
              </p>
            </Card>
          </div>

          <Card padding="lg">
            <CardHeader className="mb-2 flex-wrap">
              <CardTitle className="text-2xl">Earnings over time</CardTitle>
              <span className="text-[13px] text-foreground-muted">
                {formatCurrency(monthly.reduce((a, m) => a + m.amount, 0))} over 6 months
              </span>
            </CardHeader>
            <EarningsChart data={monthly} />
          </Card>

          <Statement lines={statement} />
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <GradientStatCard
            value={<NumberFlow value={totals.available} format={MONEY} />}
            label="Available to withdraw"
          />

          <Card padding="lg" className="flex flex-col gap-4">
            <CardTitle className="text-2xl">Request a payout</CardTitle>

            <div className="flex items-start gap-3 rounded-md border border-border bg-card-raised p-4">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-foreground-subtle" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">Bank transfer</p>
                <p className="text-sm text-foreground-muted">
                  {bankMethod?.account_number
                    ? `${bankMethod.bank_account_holder} · ${bankMethod.bank_name ?? "Bank"} ····${bankMethod.bank_last_four ?? ""}`
                    : "No bank details on file."}
                </p>
                <Dialog
                  open={editingBank}
                  onOpenChange={(open) => {
                    setEditingBank(open);
                    if (open) {
                      setBankHolder(bankMethod?.bank_account_holder ?? "");
                      setBankName(bankMethod?.bank_name ?? "");
                      setAccountNumber(bankMethod?.account_number ?? "");
                    }
                  }}
                >
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="mt-3">
                        {bankMethod?.account_number ? "Edit" : "Add details"}
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogTitle>Bank transfer details</DialogTitle>
                    <DialogDescription>
                      Where we send your payouts. Only you and the Naano payments team can see these details.
                    </DialogDescription>
                    <form onSubmit={handleSaveBank} className="mt-4 flex flex-col gap-3">
                      <input
                        className="input"
                        aria-label="Account holder name"
                        placeholder="Account holder name"
                        value={bankHolder}
                        onChange={(e) => setBankHolder(e.target.value)}
                        required
                      />
                      <input
                        className="input"
                        aria-label="Bank name"
                        placeholder="Bank name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                      />
                      <input
                        className="input"
                        aria-label="IBAN or account number"
                        placeholder="IBAN or account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        autoComplete="off"
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
              </div>
            </div>
            <div className="flex gap-2 border-t border-border pt-4">
              <input
                className="input"
                aria-label="Payout amount (USD)"
                placeholder="Amount (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
              <Button variant="outline" onClick={() => setAmount(String(totals.available))}>
                All
              </Button>
            </div>

            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="primary" className="w-full" disabled={totals.available < minPayout || withdrawing}>
                    Request payout
                  </Button>
                }
              />
              <DialogContent>
                <DialogTitle>Request this payout?</DialogTitle>
                <DialogDescription>
                  {formatCurrency(Number(amount) || totals.available)} leaves your available balance now and is sent to your
                  bank account by the Naano team. Minimum payout is {formatCurrency(minPayout)}.
                </DialogDescription>
                <div className="mt-5 flex justify-end gap-2">
                  <DialogClose render={<Button variant="ghost">Cancel</Button>} />
                  <DialogClose render={<Button variant="primary" onClick={handleWithdraw}>Confirm</Button>} />
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </aside>
      </div>

      <PayoutRequests requests={payoutRequests} />
    </>
  );
}

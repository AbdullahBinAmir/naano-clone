import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/admin/copy-button";
import { PayoutActions } from "@/components/admin/payout-actions";
import { requireProfile } from "@/lib/auth/require-profile";
import { getPayoutQueue } from "@/lib/admin/queries";
import { formatCurrency } from "@/lib/utils";

const VARIANT = { requested: "warning", processing: "warning", paid: "success", failed: "danger" } as const;

export default async function AdminPayoutsPage() {
  await requireProfile("admin");
  const queue = await getPayoutQueue();
  const open = queue.filter((r) => r.status === "requested" || r.status === "processing");
  const closed = queue.filter((r) => r.status === "paid" || r.status === "failed");

  return (
    <>
      <PageHeader
        title="Payout queue"
        description="Send each transfer from your bank, then mark it paid with the transfer reference. Failed payouts return to the creator's balance."
      />

      <section aria-labelledby="open" className="flex flex-col gap-3">
        <h2 id="open" className="text-2xl font-medium">To send ({open.length})</h2>
        {open.length === 0 ? (
          <Card padding="lg" className="text-center text-foreground-muted">Nothing waiting — no payouts are requested right now.</Card>
        ) : (
          open.map((r) => (
            <Card key={r.id} padding="lg" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-3xl font-semibold tracking-tight">{formatCurrency(Number(r.amount), r.currency)}</p>
                  <Badge variant={VARIANT[r.status]}>{r.status}</Badge>
                </div>
                <p className="mt-1 text-foreground-muted">
                  {r.creatorName} · requested {new Date(r.requested_at).toLocaleString()}
                </p>
                <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
                  <dt className="text-foreground-muted">Account holder</dt>
                  <dd>{r.account_holder}</dd>
                  <dt className="text-foreground-muted">Bank</dt>
                  <dd>{r.bank_name}</dd>
                  <dt className="text-foreground-muted">IBAN / account</dt>
                  <dd className="flex items-center gap-2 font-mono">
                    {r.account_number} <CopyButton value={r.account_number} label="account number" />
                  </dd>
                </dl>
              </div>
              <PayoutActions id={r.id} status={r.status} amount={Number(r.amount)} currency={r.currency} />
            </Card>
          ))
        )}
      </section>

      <section aria-labelledby="closed" className="flex flex-col gap-3">
        <h2 id="closed" className="text-2xl font-medium">History</h2>
        <Card padding="lg">
          {closed.length === 0 ? (
            <p className="text-center text-foreground-muted">No completed payouts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {closed.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{formatCurrency(Number(r.amount), r.currency)} · {r.creatorName}</p>
                    <p className="text-[13px] text-foreground-muted">
                      {r.processed_at ? new Date(r.processed_at).toLocaleDateString() : ""} · {r.bank_name} ····{r.account_number.slice(-4)}
                      {r.reference ? ` · ref ${r.reference}` : ""}
                      {r.admin_note ? ` · ${r.admin_note}` : ""}
                    </p>
                  </div>
                  <Badge variant={VARIANT[r.status]}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}

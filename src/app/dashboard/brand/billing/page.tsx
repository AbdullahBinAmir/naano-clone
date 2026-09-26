import { CreditCard, Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { TestModeNotice } from "@/components/ui/test-mode-notice";
import { DataTable, type Column } from "@/components/ui/data-table";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getBrandDeals, type BoardDeal } from "@/lib/brand/get-brand-deals";
import type { PaymentRow } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

const PLANS = [
  { key: "self_serve", name: "Self-Serve", price: "$0/mo + per-post spend", description: "Set your own filters, book directly, pay per post." },
  { key: "managed", name: "Managed", price: "$700/mo", description: "Full-service matching, briefing and campaign management." },
] as const;

const STATUS_VARIANT = { active: "accent", completed: "success" } as const;

export default async function BillingPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const [{ data: brand }, deals, { data: payments }] = await Promise.all([
    supabase.from("brand_profiles").select("plan_tier").eq("profile_id", user.id).maybeSingle(),
    getBrandDeals(supabase, user.id),
    supabase.from("payments").select("*").eq("brand_profile_id", user.id).eq("status", "paid").order("paid_at", { ascending: false }),
  ]);
  const sandbox = process.env.SAFEPAY_ENV !== "production";
  const titleByCollab = new Map(deals.map((d) => [d.id, d.campaignTitle]));
  const totalPaid = (payments ?? []).reduce((acc, p) => acc + Number(p.gross_amount), 0);
  const planTier = brand?.plan_tier ?? "self_serve";

  // Bookings the brand has committed to. There is no payment record yet, so
  // this is agreed value, not money that has moved.
  const bookings = deals.filter((d) => d.status === "active" || d.status === "completed");
  const total = bookings.reduce((acc, d) => acc + d.agreedPrice, 0);
  const now = new Date();
  const thisMonth = bookings
    .filter((d) => {
      const c = new Date(d.createdAt);
      return c.getUTCFullYear() === now.getUTCFullYear() && c.getUTCMonth() === now.getUTCMonth();
    })
    .reduce((acc, d) => acc + d.agreedPrice, 0);

  const columns: Column<BoardDeal>[] = [
    { header: "Creator", cell: (d) => <span className="font-medium">{d.creator.name}</span> },
    { header: "Campaign", cell: (d) => <span className="text-foreground-muted">{d.campaignTitle}</span> },
    {
      header: "Status",
      cell: (d) => (
        <Badge variant={STATUS_VARIANT[d.status as "active" | "completed"]}>{d.status === "completed" ? "Completed" : "Active"}</Badge>
      ),
    },
    { header: "Booked", cell: (d) => new Date(d.createdAt).toLocaleDateString() },
    { header: "Amount", cell: (d) => <span className="font-medium">{formatCurrency(d.agreedPrice)}</span>, className: "text-right" },
  ];

  return (
    <>
      <PageHeader eyebrow="Billing" title="Billing" description="Your plan, what you've booked, and your payment method." />

      {sandbox && (
        <TestModeNotice>
          Payments run in Safepay&apos;s sandbox — use Safepay&apos;s test cards. No real money is charged.
        </TestModeNotice>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total booked", value: formatCurrency(total), caption: `${bookings.length} active or completed ${bookings.length === 1 ? "deal" : "deals"}` },
          { label: "Booked this month", value: formatCurrency(thisMonth), caption: "Deals started in the current month" },
          { label: "Paid to date", value: formatCurrency(totalPaid), caption: `${(payments ?? []).length} ${(payments ?? []).length === 1 ? "payment" : "payments"} incl. platform fee` },
        ].map((t) => (
          <Card key={t.label} padding="lg">
            <p className="text-[13px] text-foreground-muted">{t.label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{t.value}</p>
            <p className="mt-2 text-[13px] text-foreground-muted">{t.caption}</p>
          </Card>
        ))}
      </div>

      <section aria-labelledby="plan-title" className="flex flex-col gap-3">
        <CardTitle id="plan-title" className="text-2xl">
          Plan
        </CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const current = plan.key === planTier;
            return (
              <Card key={plan.key} padding="lg" tone={current ? "raised" : "default"} className={current ? "ring-2 ring-accent" : undefined}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{plan.name}</h3>
                  {current && <Badge variant="accent">Current plan</Badge>}
                </div>
                <p className="mt-2 text-2xl font-semibold">{plan.price}</p>
                <p className="mt-2 text-sm text-foreground-muted">{plan.description}</p>
              </Card>
            );
          })}
        </div>
        <p className="text-[13px] text-foreground-muted">Plan changes aren&apos;t self-serve yet.</p>
      </section>

      <Card padding="lg" className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-card-raised">
          <CreditCard className="h-5 w-5 text-foreground-subtle" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-medium">Payment method</p>
          <p className="text-sm text-foreground-muted">
            You pay per deal through Safepay&apos;s secure checkout once a creator is accepted — no card is stored here.
          </p>
        </div>
      </Card>

      <section aria-labelledby="payments-title" className="flex flex-col gap-3">
        <CardTitle id="payments-title" className="text-2xl">
          Payments
        </CardTitle>
        <DataTable
          columns={[
            { header: "Date", cell: (p: PaymentRow) => (p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—") },
            { header: "Campaign", cell: (p: PaymentRow) => <span className="text-foreground-muted">{titleByCollab.get(p.collaboration_id) ?? "Deal"}</span> },
            { header: "Creator price", cell: (p: PaymentRow) => formatCurrency(Number(p.price), p.currency) },
            { header: "Platform fee", cell: (p: PaymentRow) => formatCurrency(Number(p.platform_fee), p.currency) },
            { header: "Total", cell: (p: PaymentRow) => <span className="font-medium">{formatCurrency(Number(p.gross_amount), p.currency)}</span>, className: "text-right" },
          ]}
          rows={payments ?? []}
          rowKey={(p: PaymentRow) => p.id}
          emptyState={
            <div className="flex flex-col items-center gap-2 text-foreground-muted">
              <Receipt className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
              <p className="font-medium text-foreground">No payments yet</p>
              <p className="text-sm">When you pay for an accepted deal, the receipt shows up here.</p>
            </div>
          }
        />
      </section>

      <section aria-labelledby="history-title" className="flex flex-col gap-3">
        <CardTitle id="history-title" className="text-2xl">
          Booking history
        </CardTitle>
        <DataTable
          columns={columns}
          rows={bookings}
          rowKey={(d) => d.id}
          emptyState={
            <div className="flex flex-col items-center gap-2 text-foreground-muted">
              <Receipt className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
              <p className="font-medium text-foreground">Nothing booked yet</p>
              <p className="text-sm">Accepted pitches and creator-accepted offers show up here.</p>
            </div>
          }
        />
      </section>
    </>
  );
}

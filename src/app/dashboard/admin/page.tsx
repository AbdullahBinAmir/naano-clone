import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getAdminCounts } from "@/lib/admin/queries";

export default async function AdminOverviewPage() {
  const c = await getAdminCounts();
  const tiles = [
    { label: "Payouts to send", value: c.openPayouts, href: "/dashboard/admin/payouts", hint: "Requested or being processed" },
    { label: "Open disputes", value: c.openDisputes, href: "/dashboard/admin/disputes", hint: "Payment frozen until you decide" },
    { label: "Awaiting brand payment", value: c.awaitingPayment, href: "/dashboard/admin/payments", hint: "Cancelled automatically after the expiry window" },
    { label: "Posts in review", value: c.inReview, href: "/dashboard/admin/payments", hint: "Auto-approved if the brand doesn't respond" },
  ];
  return (
    <>
      <PageHeader title="Money operations" description="Send creator payouts, settle disputes and record refunds." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
            <Card padding="lg" className="h-full transition-colors hover:bg-card-raised">
              <p className="text-[13px] text-foreground-muted">{t.label}</p>
              <p className="mt-2 text-5xl font-semibold tracking-tight">{t.value}</p>
              <p className="mt-2 text-[13px] text-foreground-muted">{t.hint}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

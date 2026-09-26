import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RefundButton } from "@/components/admin/refund-button";
import { requireProfile } from "@/lib/auth/require-profile";
import { getPaymentsOverview } from "@/lib/admin/queries";
import { formatCurrency } from "@/lib/utils";

const VARIANT = { paid: "success", refunded: "neutral", pending: "warning", failed: "danger", cancelled: "neutral" } as const;
const REFUNDABLE = new Set(["active", "in_review", "disputed"]);

export default async function AdminPaymentsPage() {
  await requireProfile("admin");
  const payments = await getPaymentsOverview();
  const paidTotal = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + Number(p.gross_amount), 0);
  const feeTotal = payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + Number(p.platform_fee), 0);

  return (
    <>
      <PageHeader title="Payments" description="Every Safepay checkout. Refund a paid deal that hasn't completed." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card padding="lg">
          <p className="text-[13px] text-foreground-muted">Collected (paid, not refunded)</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(paidTotal)}</p>
        </Card>
        <Card padding="lg">
          <p className="text-[13px] text-foreground-muted">Platform fees in that total</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(feeTotal)}</p>
        </Card>
      </div>
      <Card padding="lg">
        {payments.length === 0 ? (
          <p className="text-center text-foreground-muted">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="font-medium">
                    {p.collab?.campaign_title ?? "Deal"} · {p.collab?.brand_name}
                  </p>
                  <p className="text-[13px] text-foreground-muted">
                    {new Date(p.created_at).toLocaleString()} · price {formatCurrency(Number(p.price), p.currency)} + fee{" "}
                    {formatCurrency(Number(p.platform_fee), p.currency)}
                    {p.refund_reference ? ` · refund ref ${p.refund_reference}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{formatCurrency(Number(p.gross_amount), p.currency)}</span>
                  <Badge variant={VARIANT[p.status]}>{p.status}</Badge>
                  {p.status === "paid" && p.collab && REFUNDABLE.has(p.collab.status) && <RefundButton collaborationId={p.collaboration_id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DisputeActions } from "@/components/admin/dispute-actions";
import { requireProfile } from "@/lib/auth/require-profile";
import { getDisputes } from "@/lib/admin/queries";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDisputesPage() {
  await requireProfile("admin");
  const disputes = await getDisputes();
  const open = disputes.filter((d) => d.status === "open");
  const resolved = disputes.filter((d) => d.status === "resolved");

  return (
    <>
      <PageHeader
        title="Disputes"
        description="Payment for a disputed deal is frozen. Decide whether the creator is paid or the brand is refunded."
      />

      <section aria-labelledby="open" className="flex flex-col gap-3">
        <h2 id="open" className="text-2xl font-medium">Open ({open.length})</h2>
        {open.length === 0 ? (
          <Card padding="lg" className="text-center text-foreground-muted">No open disputes.</Card>
        ) : (
          open.map((d) => (
            <Card key={d.id} padding="lg" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-medium">{d.collab?.campaign_title ?? "Deal"}</p>
                  <p className="text-foreground-muted">
                    {d.collab?.brand_name} × {d.creatorName} · opened {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">
                    {d.payment ? formatCurrency(Number(d.payment.gross_amount), d.payment.currency) : formatCurrency(Number(d.collab?.agreed_price ?? 0))}
                  </p>
                  <p className="text-[13px] text-foreground-muted">
                    Creator payout {formatCurrency(Number(d.collab?.net_payout_to_creator ?? 0))}
                  </p>
                </div>
              </div>
              <blockquote className="rounded-md border border-border bg-card-raised p-4 text-sm">“{d.reason}”</blockquote>
              {d.collab?.post_url && (
                <a href={d.collab.post_url} target="_blank" rel="noreferrer" className="text-sm text-accent underline-offset-2 hover:underline">
                  View the submitted LinkedIn post ↗
                </a>
              )}
              <DisputeActions disputeId={d.id} />
            </Card>
          ))
        )}
      </section>

      <section aria-labelledby="resolved" className="flex flex-col gap-3">
        <h2 id="resolved" className="text-2xl font-medium">Resolved</h2>
        <Card padding="lg">
          {resolved.length === 0 ? (
            <p className="text-center text-foreground-muted">Nothing resolved yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {resolved.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{d.collab?.campaign_title ?? "Deal"} · {d.collab?.brand_name} × {d.creatorName}</p>
                    <p className="text-[13px] text-foreground-muted">
                      {d.resolved_at ? new Date(d.resolved_at).toLocaleDateString() : ""}
                      {d.resolution_note ? ` · ${d.resolution_note}` : ""}
                    </p>
                  </div>
                  <Badge variant={d.resolution === "release" ? "success" : "neutral"}>
                    {d.resolution === "release" ? "Creator paid" : "Brand refunded"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}

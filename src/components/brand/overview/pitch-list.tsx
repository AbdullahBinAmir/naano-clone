"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { updateCollaborationStatusAction } from "@/lib/actions/collaborations";
import type { OverviewDeal } from "@/lib/brand/get-brand-overview";
import { formatCurrency, initials } from "@/lib/utils";

export function PitchList({ pitches }: { pitches: OverviewDeal[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function act(id: string, action: "accept" | "decline") {
    setPendingId(id);
    const result = await updateCollaborationStatusAction({ collaborationId: id, action });
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(action === "accept" ? "Pitch accepted" : "Pitch declined");
    router.refresh();
  }

  return (
    <section aria-labelledby="pitches-title" className="flex flex-col gap-3">
      <CardTitle id="pitches-title" className="text-2xl">
        New pitches
      </CardTitle>
      {pitches.length === 0 ? (
        <Card padding="md" className="flex flex-col items-center gap-2 py-8 text-center text-foreground-muted">
          <Inbox className="h-6 w-6 text-foreground-subtle" strokeWidth={1.5} />
          <p className="font-medium text-foreground">No new pitches</p>
          <p className="text-sm">Creators who apply to your campaigns show up here.</p>
        </Card>
      ) : (
        pitches.map((p) => {
          const busy = pendingId === p.id;
          return (
            <Card key={p.id} tone="raised" padding="sm" className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar src={p.creator.avatarUrl} alt={p.creator.name} fallback={initials(p.creator.name)} className="h-12 w-12" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.creator.name}</p>
                  <p className="truncate text-sm text-foreground-muted">
                    {p.campaignTitle} · {formatCurrency(p.agreedPrice)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" className="flex-1" disabled={busy} onClick={() => act(p.id, "accept")}>
                  {busy ? "…" : "Accept"}
                </Button>
                <Button size="sm" variant="outline" className="flex-1" disabled={busy} onClick={() => act(p.id, "decline")}>
                  Decline
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </section>
  );
}

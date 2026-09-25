"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** In-shell error state: keeps the sidebar and topbar, only the page body is replaced. */
export function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card padding="lg" className="mx-auto mt-10 max-w-md text-center">
      <h1 className="text-xl font-semibold">This page couldn&apos;t load</h1>
      <p className="mt-2 text-sm text-foreground-muted">Something went wrong while fetching your data. Try again in a moment.</p>
      {error.digest ? <p className="mt-3 text-xs text-foreground-subtle">Reference: {error.digest}</p> : null}
      <Button variant="primary" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}

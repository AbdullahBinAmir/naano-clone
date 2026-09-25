"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-svh items-center justify-center px-5">
      <Card padding="lg" className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-foreground-muted">An unexpected error occurred. You can try again or head back home.</p>
        {error.digest ? <p className="mt-3 text-xs text-foreground-subtle">Reference: {error.digest}</p> : null}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "md" })}>
            Home
          </Link>
        </div>
      </Card>
    </main>
  );
}

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5">
      <Card padding="lg" className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-sm text-foreground-muted">The link may be wrong, or the page may have been removed.</p>
        <Link href="/" className={buttonVariants({ variant: "primary", size: "md", className: "mt-6" })}>
          Back to home
        </Link>
      </Card>
    </main>
  );
}

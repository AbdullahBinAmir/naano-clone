import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-base/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
            N
          </span>
          naano
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-foreground-muted sm:flex">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/dashboard/creator/overview" className="hover:text-foreground">
            Creator workspace
          </Link>
          <Link href="/dashboard/brand/overview" className="hover:text-foreground">
            Brand workspace
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "sm" })}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

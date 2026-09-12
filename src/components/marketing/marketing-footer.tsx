import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-foreground-subtle sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Naano. A demo rebuild — not the real naano.com.</p>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/sign-up" className="hover:text-foreground">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}

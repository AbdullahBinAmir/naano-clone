import Link from "next/link";

export function MarketingFooter({ wide = false }: { wide?: boolean }) {
  return (
    <footer className="border-t border-border/60 py-10">
      <div
        className={`mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-foreground-subtle sm:flex-row sm:px-6 ${wide ? "max-w-[90rem] sm:px-8 lg:px-14" : "max-w-6xl"}`}
      >
        <p>© {new Date().getFullYear()} Naano. Internal test build — payments are simulated.</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/sign-up" className="hover:text-foreground">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}

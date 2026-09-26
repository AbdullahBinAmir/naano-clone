import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-foreground-muted">Last updated {updated}</p>
        <p className="mt-6 rounded-lg bg-accent-soft px-5 py-4 text-sm text-accent-soft-foreground">
          Naano is currently an internal test build. This is a draft and will be replaced by reviewed terms before public launch.
        </p>
        <div className="mt-8 flex flex-col gap-8 text-foreground-muted [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:leading-relaxed">
          {children}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

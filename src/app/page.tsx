import Link from "next/link";
import { ArrowRight, Handshake, PenLine, Rocket, Search, TrendingUp } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Reveal } from "@/components/marketing/reveal";
import { GlassCard } from "@/components/glass/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { getDemoMatchingCreatorsSync } from "@/lib/demo-data/matching";
import { formatCurrency, initials } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

const STEPS = [
  { icon: Search, title: "Match", description: "Define your vertical and ICP — see the creators already trusted by your buyers." },
  { icon: PenLine, title: "Brief", description: "Give context, not a script. Creators write in their own voice." },
  { icon: Rocket, title: "Publish", description: "The post goes out from the creator's own LinkedIn account." },
  { icon: Handshake, title: "Pay", description: "One flat fee per post, agreed up front." },
  { icon: TrendingUp, title: "Track", description: "Per-post, per-creator click tracking on everything you run." },
];

export default function MarketingHomePage() {
  const creators = getDemoMatchingCreatorsSync();

  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />

      <section className="relative overflow-hidden px-4 pt-24 pb-20 text-center sm:px-6">
        <Reveal>
          <p className="mx-auto mb-4 w-fit rounded-full border border-border-strong bg-white/[0.04] px-4 py-1 text-xs font-medium tracking-wide text-foreground-muted uppercase">
            B2B LinkedIn creator marketplace
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Find the creators <span className="text-accent">your buyers already trust.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-foreground-muted">
            Match with vetted LinkedIn creators, brief in days, and track pipeline — sponsored posts that read like
            the creator wrote them, because they did.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Start as a brand
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link href="/onboarding" className={buttonVariants({ variant: "glass", size: "lg" })}>
              Join as a creator
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Five steps, no guesswork.</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <GlassCard className="flex h-full flex-col gap-3">
                <span className="glass-surface flex h-10 w-10 items-center justify-center rounded-md text-accent">
                  <step.icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-foreground-muted">{step.description}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Creators already in the network</h2>
          <p className="max-w-xl text-foreground-muted">A small, vetted slice — every card links to the same public page brands see.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {creators.map((c, i) => (
            <Reveal key={c.profile.handle} delay={i * 0.08}>
              <Link href={`/creators/${c.profile.handle}`}>
                <GlassCard interactive className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={c.profile.avatarUrl} alt={c.profile.displayName} fallback={initials(c.profile.displayName)} />
                    <div>
                      <p className="font-semibold">{c.profile.displayName}</p>
                      <p className="text-xs text-foreground-subtle">{c.profile.categoryTags.join(" · ")}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-foreground-muted">{c.profile.headline}</p>
                  <p className="mt-auto border-t border-border pt-3 text-sm font-medium text-accent">
                    {formatCurrency(c.card.pricePerPost)} / post
                  </p>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

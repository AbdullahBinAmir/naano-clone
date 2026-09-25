import Link from "next/link";
import { ArrowRight, Handshake, PenLine, Rocket, Search, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { DotGrid, buildDots } from "@/components/ui/dot-grid";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { formatCompactNumber, formatCurrency, initials } from "@/lib/utils";
import type { ShowcaseCreator } from "@/lib/marketing/get-landing-data";

const STEPS = [
  { icon: Search, title: "Match", description: "Define your vertical and ICP — see the creators your buyers already trust." },
  { icon: PenLine, title: "Brief", description: "Give context, not a script. Creators write in their own voice." },
  { icon: Rocket, title: "Publish", description: "The post goes out from the creator's own LinkedIn account." },
  { icon: Handshake, title: "Pay", description: "One flat fee per post, agreed up front." },
  { icon: TrendingUp, title: "Track", description: "Per-post, per-creator results on everything you run." },
];

const wrap = "mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-14";

export function TrustedBy({ brands }: { brands: string[] }) {
  if (brands.length === 0) return null;
  return (
    <div className={`${wrap} pb-10`}>
      <p className="mb-6 text-center text-sm text-white/60">Brands already booking creators on Naano</p>
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 sm:justify-between">
        {brands.slice(0, 6).map((name) => (
          <li key={name} className="text-2xl font-semibold tracking-tight text-[#B9B4DA]/70 sm:text-3xl">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className={`${wrap} scroll-mt-8 py-24`}>
      <Reveal>
        <h2 className="max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl">From brief to booked post in five steps.</h2>
        <p className="mt-4 max-w-xl text-foreground-muted">No agencies, no back-and-forth over email. Everything happens in one workspace.</p>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.05}>
            <Card padding="lg" className="flex h-full flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent-soft text-accent-soft-foreground">
                  <step.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-sm text-foreground-muted">0{i + 1}</span>
              </div>
              <div>
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{step.description}</p>
              </div>
              <DotGrid dots={buildDots({ total: 5, accent: i + 1 })} size="sm" label={`Step ${i + 1} of 5`} className="mt-auto" />
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CreatorShowcase({ creators, creatorCount }: { creators: ShowcaseCreator[]; creatorCount: number }) {
  const shown = creators.slice(0, 6);
  return (
    <section id="creators" className={`${wrap} scroll-mt-8 pb-24`}>
      <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl">Creators with an audience that buys.</h2>
          <p className="mt-4 max-w-xl text-foreground-muted">
            {creatorCount > 0
              ? `${creatorCount} vetted LinkedIn creators, each with a public card and a flat per-post price.`
              : "Vetted LinkedIn creators, each with a public card and a flat per-post price."}
          </p>
        </div>
        <Link href="/sign-up" className={buttonVariants({ variant: "outline", size: "md" })}>
          Browse all creators <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>

      {shown.length === 0 ? (
        <Card padding="lg" className="mt-12 text-center">
          <p className="text-xl font-medium">No creators are listed yet.</p>
          <p className="mt-2 text-foreground-muted">Publish your card to be the first name brands see.</p>
          <Link href="/sign-up" className={buttonVariants({ variant: "primary", size: "md", className: "mt-6" })}>
            Join as a creator
          </Link>
        </Card>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.05}>
              <Link
                href={`/creators/${c.handle}`}
                className="group block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <Card padding="lg" className="flex h-full flex-col gap-5 transition-colors group-hover:bg-card-raised">
                  <div className="flex items-center gap-4">
                    <Avatar src={c.avatarUrl} alt={c.name} fallback={initials(c.name)} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium">{c.name}</p>
                      <p className="text-sm text-foreground-muted">{formatCompactNumber(c.followers)} followers</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-foreground-muted">{c.headline || "LinkedIn creator"}</p>
                  {c.tags.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {c.tags.slice(0, 3).map((t) => (
                        <li key={t} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-soft-foreground">
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm text-foreground-muted">Per post</span>
                    <span className="text-lg font-medium">{c.pricePerPost > 0 ? formatCurrency(c.pricePerPost) : "On request"}</span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export function PricingTeaser() {
  return (
    <section className={`${wrap} pb-24`}>
      <Reveal>
        <div className="rounded-lg bg-[image:var(--gradient-feature)] p-8 text-[#1A1A1A] sm:p-12">
          <h2 className="max-w-2xl text-4xl font-medium tracking-tight sm:text-5xl">Pay per post. No retainers.</h2>
          <p className="mt-4 max-w-xl text-lg text-[#1A1A1A]/80">
            Creators set their own price. Self-serve is €0 a month; add managed matching when you want a team behind the campaign.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="inline-flex h-12 items-center gap-2 rounded-md bg-[#0D0D12] px-6 font-medium text-white transition-[filter] hover:brightness-125 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sign-up" className="inline-flex h-12 items-center rounded-md px-6 font-medium text-[#1A1A1A] ring-1 ring-[#1A1A1A]/30 transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:outline-none">
              Create a free account
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

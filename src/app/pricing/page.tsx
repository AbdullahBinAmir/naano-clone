import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { GlassCard } from "@/components/glass/glass-card";
import { buttonVariants } from "@/components/ui/button";

const PLANS = [
  {
    name: "Self-Serve",
    price: "€0",
    period: "/month + per-post spend",
    description: "Set your own filters, book directly, pay a flat fee per post.",
    features: ["Full creator directory access", "Direct booking, no middleman", "Per-post, per-creator click tracking", "Pay only for posts you book"],
  },
  {
    name: "Managed",
    price: "€700",
    period: "/month",
    description: "Full-service matching, briefing and campaign management.",
    features: ["Dedicated campaign manager", "Creator sourcing & vetting", "Brief writing support", "Monthly performance reporting"],
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Simple pricing for brands</h1>
          <p className="mt-3 text-foreground-muted">Creators set their own per-post price — you only pay for what you book.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <GlassCard key={plan.name} strong={plan.featured} className={plan.featured ? "border-accent/40" : undefined}>
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{plan.price}</span>
                <span className="text-sm text-foreground-muted">{plan.period}</span>
              </p>
              <p className="mt-3 text-sm text-foreground-muted">{plan.description}</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={buttonVariants({ variant: plan.featured ? "primary" : "glass", size: "md", className: "mt-8 w-full" })}
              >
                Get started
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}

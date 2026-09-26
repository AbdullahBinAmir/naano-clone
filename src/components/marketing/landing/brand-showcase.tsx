import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { SCENES } from "@/lib/marketing/landing-photos";
import { SAMPLE_BRANDS } from "@/lib/marketing/landing-static";

const CASES = [
  { brandId: "northwind", photo: SCENES.team, alt: "A team reviewing campaign results together" },
  { brandId: "parallel", photo: SCENES.brainstorm, alt: "A marketing team brainstorming with sticky notes" },
  { brandId: "halcyon", photo: SCENES.celebrate, alt: "Two colleagues celebrating a successful campaign" },
] as const;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function BrandShowcase() {
  return (
    <section id="brands" className="relative overflow-hidden">
      {/* same violet-to-black glow language as the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 100% 0%, rgba(138,91,224,0.32), transparent 70%), radial-gradient(40% 30% at 0% 100%, rgba(245,197,66,0.10), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[90rem] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <Reveal className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">Brands</p>
            <h2 className="mt-5 text-[clamp(2.1rem,4.4vw,3.75rem)] leading-[1.07] font-medium tracking-[-0.01em]">
              <span className="block text-white">Brands turning LinkedIn</span>
              <span className="block text-[#C4A6EE]">
                into a pipeline channel.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-lg text-foreground-muted">
            Sponsored posts from creators their buyers already follow — with reporting on what every campaign delivered.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {CASES.map((c, i) => {
            const brand = SAMPLE_BRANDS.find((b) => b.id === c.brandId)!;
            const now = sum(brand.daily);
            const before = sum(brand.dailyPrevious);
            const lift = Math.round(((now - before) / before) * 100);
            return (
              <Reveal key={brand.id} delay={i * 0.07}>
                <article className="group relative isolate flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-lg border border-white/10 p-6 sm:p-7">
                  <Image
                    src={c.photo}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(8,4,20,0.96) 12%, rgba(40,20,90,0.55) 55%, rgba(60,30,130,0.25) 100%)",
                    }}
                  />
                  <span className={`text-3xl text-white ${brand.wordmark}`}>{brand.name}</span>
                  <div>
                    <p className="flex items-center gap-2 text-6xl font-semibold tracking-tight text-white">
                      +{lift}%
                      <ArrowUpRight className="h-7 w-7 text-[#F5C542]" strokeWidth={2} />
                    </p>
                    <p className="mt-1 text-white/80">impressions vs the previous 28 days</p>
                    <div className="mt-5 border-t border-white/15 pt-4">
                      <p className="font-medium text-white">{brand.campaign}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {brand.creators} creators · {brand.posts} posts · {brand.engagementRate}% engagement
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-foreground-subtle">Sample campaigns for illustration — fictional brands and figures.</p>
      </div>
    </section>
  );
}

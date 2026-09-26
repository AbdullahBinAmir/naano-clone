import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { heroPill } from "@/components/marketing/landing/landing-header";
import { PORTRAITS, SCENES, type ShowcaseCreatorWithPhoto } from "@/lib/marketing/landing-photos";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

const wrap = "mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-14";

const eyebrow = "inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80";
const h2 = "mt-5 text-[clamp(2.1rem,4.4vw,3.75rem)] leading-[1.07] font-medium tracking-[-0.01em]";

const AUDIENCES = [
  {
    label: "For brands",
    title: "Reach buyers through voices they trust",
    photo: SCENES.whiteboard,
    alt: "A marketing team planning a campaign at a whiteboard",
    points: [
      "Search creators by vertical, audience and price",
      "Publish briefs and review pitches side by side",
      "Track reach and engagement on every post",
    ],
    cta: "Start as a brand",
  },
  {
    label: "For creators",
    title: "Turn your LinkedIn audience into income",
    photo: SCENES.desk,
    alt: "A creator writing at a laptop with a coffee",
    points: [
      "One public card with your rate and audience",
      "Apply to briefs or get booked directly",
      "See earnings and withdraw from one balance",
    ],
    cta: "Start as a creator",
  },
];

export function AudienceSplit() {
  return (
    <section className={`${wrap} py-24 lg:py-32`}>
      <Reveal className="max-w-3xl">
        <p className={eyebrow}>Two sides, one workspace</p>
        <h2 className={h2}>
          <span className="block text-white">Built for the people who</span>
          <span className="block text-[#C4A6EE]">buy and the people who post.</span>
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {AUDIENCES.map((a, i) => (
          <Reveal key={a.label} delay={i * 0.07}>
            <article className="relative isolate flex h-full min-h-[34rem] flex-col justify-end gap-6 overflow-hidden rounded-lg border border-white/10 p-7 sm:p-10">
              <Image src={a.photo} alt={a.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="-z-20 object-cover" />
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{ background: "linear-gradient(to top, rgba(8,4,20,0.97) 20%, rgba(70,35,150,0.6) 65%, rgba(120,80,220,0.3) 100%)" }}
              />
              <div>
                <p className="text-sm font-medium text-[#E9D5FF]">{a.label}</p>
                <h3 className="mt-2 max-w-md text-3xl font-medium tracking-tight text-white sm:text-4xl">{a.title}</h3>
              </div>
              <ul className="flex flex-col gap-3">
                {a.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-white/85">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className={`${heroPill} w-fit`}>
                {a.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CreatorShowcase({ creators, creatorCount }: { creators: ShowcaseCreatorWithPhoto[]; creatorCount: number }) {
  const shown = creators.slice(0, 6);
  return (
    <section id="creators" className={`${wrap} scroll-mt-8 pb-24 lg:pb-32`}>
      <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className={eyebrow}>Creators</p>
          <h2 className={h2}>
            <span className="block text-white">Creators with an</span>
            <span className="block text-[#C4A6EE]">audience that buys.</span>
          </h2>
          <p className="mt-5 max-w-xl text-foreground-muted">
            {creatorCount > 0
              ? `${creatorCount} vetted LinkedIn creators, each with a public card and a flat per-post price.`
              : "Vetted LinkedIn creators, each with a public card and a flat per-post price."}
          </p>
        </div>
        <Link href="/sign-up" className={heroPill}>
          Browse creators <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>

      {shown.length === 0 ? (
        <div className="mt-12 rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-xl font-medium">No creators are listed yet.</p>
          <p className="mt-2 text-foreground-muted">Publish your card to be the first name brands see.</p>
          <Link href="/sign-up" className={`${heroPill} mt-6`}>
            Join as a creator
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.06}>
              <Link
                href={`/creators/${c.handle}`}
                className="group block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors group-hover:border-white/20">
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src={c.avatarUrl}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(20,20,22,1) 0%, rgba(20,20,22,0) 45%)" }}
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                      {formatCompactNumber(c.followers)} followers
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6 pt-2">
                    <div>
                      <h3 className="text-xl font-medium">{c.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">{c.headline || "LinkedIn creator"}</p>
                    </div>
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
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

const CTA_BACKGROUND = [
  "radial-gradient(55% 60% at 0% 0%, rgba(245,197,66,0.5), transparent 70%)",
  "linear-gradient(to bottom, transparent 70%, #000 100%)",
  "linear-gradient(150deg, #EAD9B4 0%, #C4A6EE 24%, #8A5BE0 50%, #4A2A98 74%, #0C0818 100%)",
].join(", ");

/** Closing band: same gradient, two-tone headline and glowing pills as the hero. */
export function FinalCta() {
  const faces = [PORTRAITS[3], PORTRAITS[5], PORTRAITS[1], PORTRAITS[7], PORTRAITS[4]];
  return (
    <section className="relative overflow-hidden" style={{ background: CTA_BACKGROUND }}>
      <div className={`${wrap} grid items-center gap-12 py-24 lg:grid-cols-[1.2fr_1fr] lg:py-32`}>
        <Reveal>
          <h2 className="text-[clamp(2.1rem,4.4vw,4rem)] leading-[1.07] font-medium tracking-[-0.01em]">
            <span className="block text-[#1A1A1A]">Your next customer is</span>
            <span className="block text-[#1A1A1A]">already following</span>
            <span className="block text-white">someone on LinkedIn.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-white/85">
            Pay per post, no retainers. Self-serve is €0 a month — creators set their own price, you only pay for what you book.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/sign-up" className={heroPill}>
              Get started free <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <Link href="/pricing" className="text-[length:1.0625rem] font-medium text-white underline-offset-4 hover:underline">
              See pricing
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="relative mx-auto aspect-[4/3] w-full max-w-lg lg:max-w-none">
          <div className="absolute inset-0 overflow-hidden rounded-lg shadow-[0_30px_80px_rgba(12,8,24,0.55)]">
            <Image src={SCENES.loft} alt="A marketing team presenting campaign results in a bright office" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <ul className="absolute -bottom-5 left-6 flex" aria-hidden>
            {faces.map((src, i) => (
              <li key={src} className={i === 0 ? "" : "-ml-3"}>
                <Image src={src} alt="" width={56} height={56} className="h-14 w-14 rounded-full border-[3px] border-white object-cover shadow-[0_0_24px_rgba(255,255,255,0.3)]" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

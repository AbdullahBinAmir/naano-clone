"use client";

import * as React from "react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { BarChart3, CalendarClock, Check, Heart, MessageCircle, Repeat2, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatCompactNumber, formatCurrency, initials } from "@/lib/utils";
import { PORTRAITS, SCENES, type ShowcaseCreatorWithPhoto } from "@/lib/marketing/landing-photos";

interface Chapter {
  id: string;
  step: string;
  photo: string;
  title: string;
  body: string;
  points: string[];
}

const CHAPTERS: Chapter[] = [
  {
    id: "match",
    step: "01",
    photo: SCENES.laptop,
    title: "Find the voices your buyers already follow",
    body: "Filter by vertical, audience seniority and price. Every creator has a public card with a flat per-post rate — no negotiation spreadsheets.",
    points: ["Vetted creators with 1,000+ followers", "Transparent per-post pricing", "Message anyone before you book"],
  },
  {
    id: "book",
    step: "02",
    photo: SCENES.whiteboard,
    title: "Send a brief or book a post in one click",
    body: "Publish a brief and let creators pitch you, or send a direct offer at their listed price. Both sides see the same deal, the same status.",
    points: ["Briefs with budget and apply-by date", "Direct offers in a single click", "Built-in chat for every deal"],
  },
  {
    id: "publish",
    step: "03",
    photo: SCENES.desk,
    title: "The post goes out in the creator's own voice",
    body: "No ghostwritten ads. The creator publishes from their own LinkedIn account, so it lands in the feed like the rest of their content.",
    points: ["Native, unscripted posts", "Creator keeps full editorial control", "Marked as published inside Naano"],
  },
  {
    id: "track",
    step: "04",
    photo: SCENES.loft,
    title: "See the results. Pay the creator.",
    body: "Impressions and engagement roll up per post and per campaign. When the post is live, the payout moves to the creator's balance.",
    points: ["Per-post and per-campaign reporting", "Clear payout timeline for creators", "One ledger for both sides"],
  },
];

/* ------------------------------------------------------------------ mocks */

/** A stock photo with the product preview floating on top — same violet-lit look as the hero. */
function StageFrame({ photo, children, className }: { photo: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-lg", className)}>
      <Image src={photo} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="-z-20 object-cover" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(150deg, rgba(196,166,238,0.28) 0%, rgba(110,70,200,0.5) 50%, rgba(12,8,24,0.78) 100%)" }}
      />
      <div className="h-full p-4 sm:p-6">{children}</div>
    </div>
  );
}

function MockShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground-muted">{label}</span>
        <span className="rounded-full bg-card-raised px-2.5 py-1 text-[11px] text-foreground-subtle">Illustrative preview</span>
      </div>
      {children}
    </div>
  );
}

const FALLBACK_ROWS = [
  { name: "Sales leadership voice", headline: "Writes about outbound and pipeline", followers: 48200, price: 620, src: PORTRAITS[0] },
  { name: "RevOps practitioner", headline: "Voice of mid-market operators", followers: 21500, price: 380, src: PORTRAITS[1] },
  { name: "Founder-led growth", headline: "Building in public, B2B SaaS", followers: 12800, price: 300, src: PORTRAITS[2] },
];
const FIT = [96, 91, 87];

function MatchMock({ creators }: { creators: ShowcaseCreatorWithPhoto[] }) {
  const [filter, setFilter] = React.useState(0);
  const filters = ["10K+ followers", "Under €1,000", "Directors & VPs"];
  const rows = (
    creators.length >= 3
      ? creators.slice(0, 3).map((c) => ({ name: c.name, headline: c.headline, followers: c.followers, price: c.pricePerPost, src: c.avatarUrl }))
      : FALLBACK_ROWS
  ).map((r, i) => ({ ...r, fit: Math.max(70, FIT[i] - filter * 3 - i) }));

  return (
    <MockShell label="Match">
      <div className="flex items-center gap-2 rounded-md border border-border-strong bg-card-raised px-3 py-2.5 text-sm text-foreground-muted">
        <Search className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
        B2B SaaS · RevOps
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filters">
        {filters.map((f, i) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === i}
            onClick={() => setFilter(i)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
              filter === i ? "bg-accent-soft text-accent-soft-foreground" : "bg-card-raised text-foreground-muted hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <ul className="mt-4 flex flex-1 flex-col gap-2.5">
        {rows.map((r, i) => (
          <motion.li
            key={r.name}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", bounce: 0, duration: 0.45 }}
            className="flex items-center gap-3 rounded-md border border-border bg-card-raised p-3 transition-colors hover:border-border-strong"
          >
            <Avatar src={r.src} alt={r.name} fallback={initials(r.name)} className="h-11 w-11" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.name}</p>
              <p className="truncate text-xs text-foreground-muted">
                {formatCompactNumber(r.followers)} followers · {r.price > 0 ? formatCurrency(r.price) : "On request"}
              </p>
            </div>
            <div className="w-20 shrink-0">
              <p className="text-right text-xs font-medium">{r.fit}% fit</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.fit}%` }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.07 }}
                />
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </MockShell>
  );
}

function BookMock() {
  const [sent, setSent] = React.useState(false);
  return (
    <MockShell label="Brief">
      <div className="rounded-md border border-border bg-card-raised p-4">
        <p className="text-xs text-foreground-muted">Northwind · Sales engagement</p>
        <p className="mt-1 text-lg font-medium">Outbound playbook launch</p>
        <p className="mt-2 text-sm text-foreground-muted">
          Share how your audience thinks about outbound in 2026. Native voice, no script.
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-foreground-muted">Budget</p>
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(3200)}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-xs font-medium text-highlight-foreground">
            <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
            Apply within 9 days
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="mt-4 w-full"
        onClick={() => setSent(true)}
        disabled={sent}
      >
        {sent ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2} /> Offer sent
          </>
        ) : (
          "Send offer"
        )}
      </Button>

      <ol className="mt-5 flex flex-col gap-3 text-sm" aria-live="polite">
        <li className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          Brief published
        </li>
        <AnimatePresence>
          {sent && (
            <>
              <motion.li
                key="sent"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                Offer delivered to the creator
              </motion.li>
              <motion.li
                key="accepted"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-black">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span>
                  Creator accepted <span className="text-foreground-muted">· chat is open</span>
                </span>
              </motion.li>
            </>
          )}
        </AnimatePresence>
      </ol>
    </MockShell>
  );
}

function PublishMock({ creators }: { creators: ShowcaseCreatorWithPhoto[] }) {
  const creator = creators[0];
  const name = creator?.name ?? "Your creator";
  const [likes, setLikes] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setLikes(1248), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <MockShell label="LinkedIn">
      <div className="rounded-md border border-border bg-card-raised p-4">
        <div className="flex items-center gap-3">
          <Avatar src={creator?.avatarUrl} alt={name} fallback={initials(name)} className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-xs text-foreground-muted">Just now · Partnership</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          Three things I learned after running outbound for 40 B2B teams — and the one habit that separated the top 10%.
          Thread below 👇
        </p>
        <div className="mt-3 h-28 rounded-md bg-[image:var(--gradient-feature)] opacity-90" aria-hidden />
        <div className="mt-4 flex items-center gap-5 text-xs text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-accent" strokeWidth={1.75} />
            <NumberFlow value={likes} />
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            <NumberFlow value={likes ? 86 : 0} />
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat2 className="h-4 w-4" strokeWidth={1.75} />
            <NumberFlow value={likes ? 41 : 0} />
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-foreground-muted">
        Published from the creator&apos;s own account — Naano marks the deal as posted and starts tracking.
      </p>
    </MockShell>
  );
}

const PAYOUT_STEPS = ["Post published", "Payout in transit", "Available to withdraw"];

function TrackMock() {
  const reduce = useReducedMotion();
  const [step, setStep] = React.useState(reduce ? 2 : 0);
  React.useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setStep((s) => (s < 2 ? s + 1 : s)), 1400);
    return () => clearInterval(t);
  }, [reduce]);

  const bars = [34, 52, 41, 68, 59, 83, 76, 96];
  return (
    <MockShell label="Campaign report">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Impressions", v: "184K" },
          { l: "Engagement", v: "5.4%" },
          { l: "Clicks", v: "3.5K" },
        ].map((k) => (
          <div key={k.l} className="rounded-md border border-border bg-card-raised p-3">
            <p className="text-[11px] text-foreground-muted">{k.l}</p>
            <p className="mt-1 text-xl font-semibold">{k.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-24 items-end gap-2 rounded-md border border-border bg-card-raised p-3" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-sm bg-accent"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
          />
        ))}
      </div>
      <ol className="mt-5 flex flex-col gap-3">
        {PAYOUT_STEPS.map((label, i) => {
          const done = i <= step;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300",
                  done ? "bg-accent text-white" : "bg-surface-3 text-foreground-subtle",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <BarChart3 className="h-3 w-3" />}
              </span>
              <span className={done ? "text-foreground" : "text-foreground-muted"}>{label}</span>
              {i === 2 && done && <span className="ml-auto font-semibold text-success">{formatCurrency(3200)}</span>}
            </li>
          );
        })}
      </ol>
    </MockShell>
  );
}

function Mock({ id, creators }: { id: string; creators: ShowcaseCreatorWithPhoto[] }) {
  if (id === "match") return <MatchMock creators={creators} />;
  if (id === "book") return <BookMock />;
  if (id === "publish") return <PublishMock creators={creators} />;
  return <TrackMock />;
}

/* --------------------------------------------------------------- the story */

export function StoryScroll({ creators }: { creators: ShowcaseCreatorWithPhoto[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const refs = React.useRef<(HTMLElement | null)[]>([]);

  // The chapter crossing the middle of the viewport is the active one.
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="mx-auto w-full max-w-[90rem] scroll-mt-8 px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
      <div className="max-w-3xl">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">How it works</p>
        <h2 className="mt-5 text-[clamp(2.1rem,4.4vw,3.75rem)] leading-[1.07] font-medium tracking-[-0.01em]">
          <span className="block text-white">From first search to</span>
          <span className="block text-[#C4A6EE]">paid creator, in one place.</span>
        </h2>
        <p className="mt-4 max-w-xl text-foreground-muted">
          Scroll through a campaign the way your team will live it — every step happens inside the same workspace.
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="relative">
          {/* progress rail */}
          <div aria-hidden className="absolute top-0 bottom-0 left-[1.4rem] hidden w-px bg-border lg:block" />
          {CHAPTERS.map((c, i) => (
            <article
              key={c.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className="relative flex flex-col justify-center gap-6 py-10 lg:min-h-[78vh] lg:pl-20"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-0 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-300 lg:flex",
                  active === i ? "border-accent bg-accent text-white" : "border-border bg-card text-foreground-muted",
                )}
              >
                {c.step}
              </span>
              <div
                className={cn(
                  "transition-opacity duration-300",
                  active === i ? "opacity-100" : "lg:opacity-40",
                )}
              >
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 lg:hidden">Step {c.step}</span>
                <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">{c.title}</h3>
                <p className="mt-3 max-w-lg text-foreground-muted">{c.body}</p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              {/* small screens: the preview sits inside the chapter */}
              <div className="lg:hidden">
                <StageFrame photo={c.photo}>
                  <Mock id={c.id} creators={creators} />
                </StageFrame>
              </div>
            </article>
          ))}
        </div>

        {/* large screens: one sticky stage that swaps with the active chapter */}
        <div className="relative hidden lg:block">
          <div className="sticky h-[32rem]" style={{ top: "calc(50vh - 16rem)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={CHAPTERS[active].id}
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -10, scale: 0.985 }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                <StageFrame photo={CHAPTERS[active].photo} className="h-full">
                  <Mock id={CHAPTERS[active].id} creators={creators} />
                </StageFrame>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

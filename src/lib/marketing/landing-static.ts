import { Hexagon, Layers, Orbit, Sparkles, Triangle, Zap, type LucideIcon } from "lucide-react";

/**
 * Static, illustrative content for the marketing landing page. None of this is
 * read from or written to the database — the brands are fictional and the
 * numbers only show what the product's reports look like. The page labels it
 * as sample data. (Creators on the landing page do come from Supabase.)
 */

export interface SampleBrand {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Tailwind classes that give each wordmark its own typographic personality. */
  wordmark: string;
  category: string;
  campaign: string;
  spend: number;
  creators: number;
  posts: number;
  engagementRate: number; // percent
  clickRate: number; // percent of impressions
  /** Daily impressions, oldest → newest, 28 days. */
  daily: number[];
  /** The 28 days before that, same length. */
  dailyPrevious: number[];
}

// Deterministic pseudo-random (LCG) so server and client render identical series.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function series(seed: number, base: number, growth: number, length = 28): number[] {
  const rand = seeded(seed);
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin(i / 2.6 + seed) * 0.16;
    const spike = i % 9 === 4 ? 0.35 : 0; // a post going live
    return Math.round(base * (1 + growth * (i / (length - 1)) + wave + spike + (rand() - 0.5) * 0.12));
  });
}

export const SAMPLE_BRANDS: SampleBrand[] = [
  {
    id: "northwind",
    name: "Northwind",
    icon: Hexagon,
    wordmark: "font-semibold tracking-tight",
    category: "Sales engagement",
    campaign: "Outbound playbook launch",
    spend: 9600,
    creators: 3,
    posts: 6,
    engagementRate: 5.4,
    clickRate: 1.9,
    daily: series(3, 8200, 0.55),
    dailyPrevious: series(11, 4300, 0.1),
  },
  {
    id: "lumen",
    name: "lumen",
    icon: Sparkles,
    wordmark: "font-medium lowercase tracking-wide",
    category: "Revenue analytics",
    campaign: "Pipeline forecasting series",
    spend: 6400,
    creators: 2,
    posts: 4,
    engagementRate: 4.7,
    clickRate: 1.6,
    daily: series(5, 6100, 0.4),
    dailyPrevious: series(17, 3900, 0.05),
  },
  {
    id: "parallel",
    name: "PARALLEL",
    icon: Layers,
    wordmark: "text-[0.8em] font-semibold tracking-[0.22em]",
    category: "Design tooling",
    campaign: "Design for revenue teams",
    spend: 4800,
    creators: 2,
    posts: 3,
    engagementRate: 6.1,
    clickRate: 2.3,
    daily: series(7, 4300, 0.7),
    dailyPrevious: series(23, 2300, 0.15),
  },
  {
    id: "halcyon",
    name: "Halcyon",
    icon: Orbit,
    wordmark: "font-light italic tracking-tight",
    category: "People ops",
    campaign: "Hiring in a slow market",
    spend: 7200,
    creators: 4,
    posts: 7,
    engagementRate: 4.2,
    clickRate: 1.4,
    daily: series(9, 7300, 0.3),
    dailyPrevious: series(29, 4900, 0.2),
  },
  {
    id: "brightloop",
    name: "Brightloop",
    icon: Zap,
    wordmark: "font-bold tracking-tighter",
    category: "Customer success",
    campaign: "Retention is the new growth",
    spend: 5500,
    creators: 3,
    posts: 5,
    engagementRate: 5.0,
    clickRate: 1.7,
    daily: series(13, 5200, 0.5),
    dailyPrevious: series(31, 3300, 0.08),
  },
  {
    id: "meridian",
    name: "Meridian",
    icon: Triangle,
    wordmark: "font-medium tracking-wide",
    category: "Security",
    campaign: "Security buyers' guide",
    spend: 8100,
    creators: 3,
    posts: 5,
    engagementRate: 3.9,
    clickRate: 1.2,
    daily: series(15, 6900, 0.35),
    dailyPrevious: series(37, 4600, 0.1),
  },
];

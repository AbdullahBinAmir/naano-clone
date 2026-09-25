import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LandingHeader, heroPill } from "@/components/marketing/landing/landing-header";
import { CursorTag, HeroOrbit } from "@/components/marketing/landing/hero-orbit";
import { CreatorShowcase, HowItWorks, PricingTeaser, TrustedBy } from "@/components/marketing/landing/landing-sections";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { getLandingData } from "@/lib/marketing/get-landing-data";

export const revalidate = 300;

// One warm light in the top-left corner, through lavender and violet, into the black canvas.
const HERO_BACKGROUND = [
  "radial-gradient(60% 45% at 0% 0%, rgba(245,197,66,0.55), transparent 70%)",
  "linear-gradient(to bottom, transparent 78%, #000 100%)",
  "linear-gradient(150deg, #EAD9B4 0%, #C4A6EE 22%, #8A5BE0 46%, #4A2A98 66%, #0C0818 90%)",
].join(", ");

export default async function MarketingHomePage() {
  const { creators, creatorCount, brandNames } = await getLandingData();

  return (
    <div className="flex min-h-svh flex-col bg-base">
      <div className="relative overflow-hidden" style={{ background: HERO_BACKGROUND }}>
        <LandingHeader />
        <section className="mx-auto grid w-full max-w-[90rem] items-center gap-8 px-5 pt-32 pb-16 sm:px-8 lg:min-h-[50rem] lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:px-14 lg:pt-28">
          <div>
            <h1 className="text-[clamp(2.1rem,4.4vw,4rem)] leading-[1.07] font-medium tracking-[-0.01em]">
              <span className="block text-[#1A1A1A]">Find the LinkedIn</span>
              <span className="block text-[#1A1A1A]">voices your buyers</span>
              <span className="block text-[#1A1A1A]">already trust —</span>
              <span className="block text-white">booked in one click.</span>
            </h1>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/sign-up" className={heroPill}>
                Find creators <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </Link>
              <Link href="/sign-up" className="text-[length:1.0625rem] font-medium text-white underline-offset-4 hover:underline">
                Join as a creator
              </Link>
            </div>
            <div className="mt-8 hidden sm:block">
              <CursorTag creator={creators[0]} />
            </div>
          </div>
          <HeroOrbit creators={creators} creatorCount={creatorCount} />
        </section>
        <TrustedBy brands={brandNames} />
      </div>

      <main>
        <HowItWorks />
        <CreatorShowcase creators={creators} creatorCount={creatorCount} />
        <PricingTeaser />
      </main>
      <MarketingFooter />
    </div>
  );
}

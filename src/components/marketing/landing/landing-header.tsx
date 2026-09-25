import Link from "next/link";

const pill =
  "inline-flex items-center justify-center rounded-full bg-[#0D0D12] px-6 font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_8px_28px_rgba(155,92,246,0.45)] transition-[transform,filter] duration-150 hover:brightness-125 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none";

export const heroPill = `${pill} h-14 gap-2 text-[length:1.0625rem]`;

/** Transparent header that sits on the hero gradient (ink on the light corner, white on the dark side). */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-24 w-full max-w-[90rem] items-center gap-6 px-5 sm:px-8 lg:px-14">
        <Link href="/" className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0D0D12] text-lg font-bold text-white">N</span>
          naano
        </Link>
        <nav aria-label="Primary" className="ml-4 hidden items-center gap-8 text-[length:1.0625rem] text-[#1A1A1A] md:flex">
          <a href="#how-it-works" className="hover:opacity-70">
            How it works
          </a>
          <a href="#creators" className="hover:opacity-70">
            Creators
          </a>
          <Link href="/pricing" className="hover:opacity-70">
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-5 text-white">
          <Link href="/sign-in" className="hidden text-[length:1.0625rem] hover:opacity-80 sm:inline">
            Log in
          </Link>
          <Link href="/sign-up" className={`${pill} h-12 text-[length:1rem]`}>
            Join now
          </Link>
        </div>
      </div>
    </header>
  );
}

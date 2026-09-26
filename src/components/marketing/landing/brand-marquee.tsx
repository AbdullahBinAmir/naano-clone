import { SAMPLE_BRANDS } from "@/lib/marketing/landing-static";

/** Slow-scrolling row of brand wordmarks along the bottom of the hero. */
export function BrandMarquee() {
  const items = [...SAMPLE_BRANDS, ...SAMPLE_BRANDS];
  return (
    <div className="pt-6 pb-14">
      <p className="mb-8 text-center text-sm text-white/65">Trusted by growth teams that sell to B2B buyers</p>
      <div
        className="group relative overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)" }}
      >
        <ul
          className="marquee-track flex w-max items-center gap-20 pr-20 group-hover:[animation-play-state:paused]"
          style={{ animation: "marquee 45s linear infinite" }}
        >
          {items.map((b, i) => (
            <li
              key={`${b.id}-${i}`}
              aria-hidden={i >= SAMPLE_BRANDS.length}
              className={`shrink-0 text-3xl text-[#C9C4E8]/80 transition-colors hover:text-white sm:text-4xl ${b.wordmark}`}
            >
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

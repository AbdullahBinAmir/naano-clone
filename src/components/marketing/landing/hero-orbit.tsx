import { BarChart3, Handshake, Megaphone, MessageCircle, Users, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatCompactNumber, initials } from "@/lib/utils";

type Slot =
  | { ring: 0 | 1 | 2; angle: number; kind: "creator"; index: number; size: string }
  | { ring: 0 | 1 | 2; angle: number; kind: "tile"; icon: LucideIcon; glow: string; label: string; tilt: number };

// Ring diameters as a share of the orbit box, outermost first.
const RINGS = [
  { size: "100%", seconds: 120, reverse: false },
  { size: "66%", seconds: 90, reverse: true },
  { size: "42%", seconds: 70, reverse: false },
] as const;

// Angles are degrees clockwise from 3 o'clock. Creator slots are filled in order
// from real data; a slot with no creator behind it is simply not drawn.
const SLOTS: Slot[] = [
  { ring: 0, angle: 205, kind: "creator", index: 0, size: "h-14 w-14 sm:h-[4.25rem] sm:w-[4.25rem] text-lg" },
  { ring: 0, angle: 292, kind: "tile", icon: Handshake, glow: "#3B82F6", label: "Deals", tilt: -8 },
  { ring: 0, angle: 40, kind: "creator", index: 1, size: "h-12 w-12 sm:h-16 sm:w-16 text-base" },
  { ring: 0, angle: 128, kind: "tile", icon: BarChart3, glow: "#F5C542", label: "Analytics", tilt: 9 },
  { ring: 1, angle: 250, kind: "tile", icon: MessageCircle, glow: "#EC4899", label: "Messages", tilt: 6 },
  { ring: 1, angle: 15, kind: "creator", index: 2, size: "h-11 w-11 sm:h-14 sm:w-14 text-base" },
  { ring: 1, angle: 135, kind: "creator", index: 3, size: "h-12 w-12 sm:h-[4.25rem] sm:w-[4.25rem] text-lg" },
  { ring: 2, angle: 320, kind: "tile", icon: Megaphone, glow: "#F97316", label: "Briefs", tilt: -6 },
  { ring: 2, angle: 165, kind: "creator", index: 4, size: "h-10 w-10 sm:h-12 sm:w-12 text-sm" },
  { ring: 2, angle: 55, kind: "tile", icon: Users, glow: "#A855F7", label: "Audience", tilt: 8 },
];

const spinCw = (s: number) => ({ animation: `orbit-spin ${s}s linear infinite` });
const spinCcw = (s: number) => ({ animation: `orbit-spin ${s}s linear infinite reverse` });

export function HeroOrbit({ avatars, creatorCount }: { avatars: { src: string; name: string }[]; creatorCount: number }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[40rem]" role="img" aria-label={`${creatorCount} LinkedIn creators on Naano`}>
      {/* rings */}
      {RINGS.map((r) => (
        <div
          key={r.size}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25"
          style={{ width: r.size, height: r.size }}
        />
      ))}

      {/* centre stat */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center text-white">
        {creatorCount > 0 ? (
          <>
            <span className="text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl">{formatCompactNumber(creatorCount)}</span>
            <span className="mt-1 text-[length:0.9375rem] font-medium sm:text-[length:1.125rem]">LinkedIn creators</span>
          </>
        ) : (
          <span className="max-w-[9rem] text-2xl leading-tight font-light sm:text-3xl">Be the first creator</span>
        )}
      </div>

      {/* satellites: each ring rotates, each satellite counter-rotates to stay upright */}
      {RINGS.map((r, ringIndex) => (
        <div
          key={r.size}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none!"
          style={{ width: r.size, height: r.size, ...(r.reverse ? spinCcw(r.seconds) : spinCw(r.seconds)) }}
        >
          {SLOTS.filter((s) => s.ring === ringIndex).map((slot, i) => {
            const creator = slot.kind === "creator" ? avatars[slot.index] : undefined;
            if (slot.kind === "creator" && !creator) return null;
            const rad = (slot.angle * Math.PI) / 180;
            return (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + 50 * Math.cos(rad)}%`, top: `${50 + 50 * Math.sin(rad)}%` }}
              >
                <span
                  className="block motion-reduce:animate-none!"
                  style={r.reverse ? spinCw(r.seconds) : spinCcw(r.seconds)}
                >
                  {slot.kind === "creator" && creator ? (
                    <Avatar
                      src={creator.src}
                      alt={creator.name}
                      fallback={initials(creator.name)}
                      className={cn("border-[3px] border-white shadow-[0_0_28px_rgba(255,255,255,0.35)]", slot.size)}
                    />
                  ) : slot.kind === "tile" ? (
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-md bg-[#0D0D12] sm:h-14 sm:w-14"
                      style={{ transform: `rotate(${slot.tilt}deg)`, boxShadow: `0 0 26px ${slot.glow}66, 0 0 0 1px ${slot.glow}33` }}
                    >
                      <slot.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: slot.glow }} strokeWidth={1.75} />
                    </span>
                  ) : null}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Small "who's looking" tag beside the CTA; only shown when there is a real creator to name. */
export function CursorTag({ creator }: { creator: { name: string; followers: number } | undefined }) {
  if (!creator) return null;
  const first = creator.name.split(" ")[0];
  return (
    <div aria-hidden className="pointer-events-none flex items-start gap-1 pl-40 sm:pl-56" style={{ animation: "cursor-bob 3.2s ease-in-out infinite" }}>
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none" className="-mr-1 mt-1 text-accent drop-shadow-[0_4px_10px_rgba(155,92,246,0.5)]">
        <path d="M3 2l19 11.5-8.2 2.2L10 24.5 3 2z" fill="currentColor" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="mt-6 rounded-full bg-accent px-4 py-1.5 text-[length:0.9375rem] font-medium text-white shadow-[0_6px_18px_rgba(155,92,246,0.45)]">
        {first} · {formatCompactNumber(creator.followers)}
      </span>
    </div>
  );
}

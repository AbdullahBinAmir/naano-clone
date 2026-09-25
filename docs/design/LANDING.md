# Landing page — reference analysis

> **Which image:** the file `docs/design/landing-ref.png` is actually the dark
> *dashboard* ("nixto", Statistics / Ongoing calls). The purple hero
> ("Marketeam") — the only landing page in the set — is
> `docs/design/dashboard-ref.png`. The two file names look swapped. This
> document describes the **purple hero** (`dashboard-ref.png`). Rename the
> files if that's the intent; nothing below depends on the names.

Reference canvas: 1892 × 1322 px, a single desktop fold, presented inside a
softly rounded frame with a thin black edge. Measurements below are read off
that canvas; the "@1440" values are the same thing scaled by 0.76 so they can
be used directly in CSS.

## 1. Sections, in order (top to bottom)

The reference shows one fold made of three stacked bands. Nothing below it is
shown, so any further sections are our own extension (see §5).

### 1.1 Header (y 0–190, content centered at y≈95)
- **Left:** logo lockup — a rounded-square glyph plus the wordmark
  "Marketeam" in near-black, ~32 px cap height (≈24 px @1440).
- **Next to it:** four text links — *Your Team, Solutions, Blog, Pricing* —
  regular weight, ~20 px (≈15 px @1440), near-black ink, ~55 px apart. No
  underline, no active state visible.
- **Right:** a plain text link *Log In*, then a **"Join Now" pill button**:
  near-black fill (#0D0D1A-ish), white text, fully rounded, ~150 × 60 px
  (≈115 × 46 @1440). It carries a faint lighter outline and a soft violet
  outer glow, so it reads as lit from behind rather than flat.
- Header is transparent — it sits directly on the gradient. Content margin
  is ~105 px each side (≈5.5 % of width, ≈80 px @1440).

### 1.2 Hero (y 190–1150) — two columns, no divider

**Left column (~45 % of width):**
1. **Headline**, six lines, left-aligned, left edge at the content margin:
   > Unlock Top / Marketing Talent / You Thought Was / Out of Reach – /
   > Now Just One / Click Away!
   Lines 1–4 are near-black ink; lines 5–6 are **white** — the colour flips
   exactly where the background darkens, so contrast is preserved across the
   gradient and the headline itself becomes a second, subtler gradient.
2. **Primary CTA** "Start Project ›" — same near-black glowing pill as
   *Join Now* but larger, ~210 × 60 px (≈160 × 46 @1440), white label with a
   thin chevron, placed ~55 px under the headline.
3. **Collaboration cursor tag** — a small purple mouse-pointer arrow with a
   purple pill label reading a first name ("David"), floating ~60 px below
   and right of the CTA. Purely decorative; it hints at live teamwork.

**Right column (~45 % of width): an orbit diagram** centred at roughly
(70 % x, 51 % y):
- **Three thin concentric rings** (hairline, white at ~20–35 % opacity),
  diameters ≈ 830 / 550 / 350 px (≈630 / 420 / 270 @1440). They are drawn
  slightly imperfectly nested, which gives a hand-placed, airy feel.
- **Centre stat:** "20k+" in large light-weight white, with the caption
  "Specialists" beneath, centred in the innermost ring.
- **Satellites sitting on the rings** (nothing is connected by lines):
  - **Circular photo avatars**, 65–90 px (≈50–68 @1440), white 2–3 px
    border, soft pastel glow. Sizes vary; five of them at irregular angles.
  - **Dark rounded-square icon tiles**, ~70 px (≈54 @1440), near-black fill,
    each with a small coloured glyph (blue / pink / orange / purple) and a
    matching coloured glow. Slightly tilted, as if drifting.
  - Avatars and tiles alternate around the rings and never overlap the
    centre stat.

### 1.3 Logo strip (y≈1245, bottom band)
- Five customer/partner wordmarks spread edge-to-edge between the content
  margins (105 px → ~1770 px): *Dreamure, SWITCH.WIN, Glowsphere, PinSpace,
  Visionix*.
- Rendered flat, in a desaturated lavender-grey (≈#9A9AC0 at 60–70 %
  opacity), ~28–36 px tall. Mixed typefaces (they are other companies'
  logos), so it's the only place the type is not the brand font.
- The strip sits on the darkest part of the gradient with generous space
  above it (~90 px) — it is a quiet "trusted by" footer for the fold.

## 2. Background and colour

- **Full-bleed diagonal gradient**, light source top-left:
  warm peach/cream (≈#F5D9A8) → lavender (≈#B18FE3) → deep violet
  (≈#6A45C2) through the middle → near-black indigo (≈#0B0B18) at the right
  edge and the bottom. Soft, blurred, no visible banding or grain.
- The top-left corner is the brightest spot; the text-heavy left column sits
  on the light half (hence dark ink), the orbit sits on the violet→dark
  transition (hence white rings/stat).
- **Palette in use:** near-black ink, white, one violet family, one warm
  peach accent in the light source. Avatars/tiles bring small pops of blue,
  pink, orange.
- **Accent behaviour:** the only saturated solid fills are the two dark pills
  and the purple cursor tag; everything else is gradient, hairline or photo.

## 3. Typography

- **One family throughout** — a geometric sans with rounded terminals and a
  large x-height (Outfit / Urbanist class). No serif, no mono.
- **Headline:** weight ~500, ≈80 px on the canvas (≈61 px @1440), line-height
  ≈1.07 (line pitch ≈86 px → ≈65 px @1440), tracking slightly tight
  (≈-0.01 em). Sentence-style capitalisation on Title Case words ("Unlock
  Top Marketing Talent…"), ending with an exclamation mark.
- **Big stat:** "20k+" weight ~300–400, same size as the headline
  (≈80 px), tight tracking.
- **Stat caption / nav / buttons:** weight 400–500, 20–24 px on the canvas
  (≈15–18 px @1440); labels in buttons are 500.
- **Scale is coarse on purpose:** ~4 sizes total (headline ≈ stat, button,
  nav, caption). No small print, no subheading paragraph under the headline.

## 4. Composition and feel

- **Asymmetric, two-mass layout:** heavy left-aligned type block balanced by a
  large airy orbit on the right; the two share one horizontal centre line.
- **Reading path:** headline → CTA → (cursor tag) → orbit stat → logo strip.
- **Lots of negative space:** no cards, no boxes; the only "containers" are
  the pills and the tiles. Ring hairlines and glows create depth instead of
  borders and shadows.
- **Depth without blur-glass:** glows and gradients only; nothing translucent
  is layered over content. (Consistent with DESIGN.md's "no glassmorphism".)
- **Motion cues implied by the picture** (not shown, but strongly suggested):
  slow rotation of the orbits, avatars drifting on their rings, the cursor tag
  bobbing — all decorative, all safe to disable under reduced-motion.
- **Density:** the whole message is one sentence, one number and one button.

## 5. How this maps to Naano (proposal for review — no code yet)

Must use the DESIGN.md palette and Outfit so it reads as the same product as
the dashboard; product name **Naano**; our own copy.

### Colours / type
| Reference | Naano |
|---|---|
| Peach-cream light source | DESIGN.md yellow `#F5C542`, softened, top-left |
| Lavender → violet | `#A855F7` → `#9B5CF6` (accent) |
| Near-black indigo | `#000000` canvas, with a faint violet lift at the mid-right |
| Dark pills (Join Now / Start Project) | `#141416` card fill, 16 px-radius pill, 1 px `rgba(255,255,255,.06)` border, violet glow |
| Ink / white headline split | white on the dark part; on the bright corner use `#1A1A1A` ink (same colour the dashboard uses on accent-soft) |
| Purple cursor tag | `#9B5CF6` pill, white text — reuse as "a brand is viewing your card" motif |
| Outfit-like geometric sans | **Outfit** (already loaded via `next/font`), same weights as the dashboard |

The full-bleed gradient is used **once** (the hero) — same rule DESIGN.md sets
for the feature gradient in the dashboard.

### Proposed structure (first fold mirrors the reference; rest is our extension)
1. **Header** — Naano logo · *Creators, Brands, Pricing* · *Log in* + **Get started** pill.
2. **Hero** — headline (two-tone), one CTA, orbit of real creators.
3. **"Trusted by" strip** — brand wordmarks/logos.
4. *(extension)* **How it works** — Match → Brief → Publish → Pay → Track, using the dashboard's card + dot-grid language.
5. *(extension)* **Creator showcase** — a row/grid of real creator cards (see §6).
6. *(extension)* **Pricing teaser** → `/pricing`.
7. **Footer** — as today.

### Draft copy (ours, editable)
- Headline: **"Find the LinkedIn voices / your buyers already trust — / booked in one click."**
  (lines 1–3 ink/white split as in the reference)
- CTAs: **Find creators** (brands, primary) · **Join as a creator** (secondary text link).
- Orbit centre: **"{n}+ creators"** where *n* is the real count (see §6).
- Cursor tag: a real creator's first name.

## 6. Data — creator showcases must come from Supabase

What the landing needs, and whether an **anonymous visitor** can already read it
(the page is public, so it queries with the anon key + RLS, server-side):

| Need | Source | Anon access today |
|---|---|---|
| Orbit avatars + showcase cards (name, avatar, headline, tags, followers, price/post) | `marketplace_creators` view joined to `creator_cards` (published only, ≥ 1,000 followers) | **Yes** — view is granted to `anon`; creator profiles and cards are readable when the card is published |
| "n+ creators" centre number | `count(*)` on `marketplace_creators` | Yes |
| "Trusted by" brand names/logos | `brand_profiles` with a published campaign | **Yes** — policy in migration 0003 lets anyone read brands that have a published campaign (`logo_url` is empty for now, so wordmarks would be text until logos can be uploaded) |
| Cursor-tag first name | a creator from the same query | Yes |

Notes and constraints:
- **No fictional data.** The current landing uses hard-coded demo creators
  (`getDemoMatchingCreatorsSync`); that goes away. If fewer than ~5 real
  creators qualify, the orbit shows what exists (and the empty state is a
  ring with the count and a "Be the first" CTA) rather than filler.
- **Avatars:** `avatar_url` is empty for every account today (no upload
  exists yet), so avatars fall back to initials on a coloured disc until
  image upload lands. The orbit must look good with initials.
- Fetch on the server (RSC), cached with short revalidation so the page is
  fast and doesn't hit Supabase on every request.
- No PII beyond what a creator already chose to publish on their public card.

## 7. Open questions for review
1. Confirm the reference is the **purple hero** (`dashboard-ref.png`) and that the file names should be swapped.
2. Hero gradient direction: keep the **top-left warm light** (yellow, as in the reference) or invert so the dark side is left for the headline (all-white text)?
3. Do we keep the reference's **two-tone headline** (ink → white), or a single white headline on a darker gradient (simpler, more consistent with the dashboard)?
4. Orbit content: **creators only**, or creators + product-feature tiles (message, chart, handshake) like the reference's icon tiles?
5. Which extension sections (§5 items 4–6) do you want in v1?

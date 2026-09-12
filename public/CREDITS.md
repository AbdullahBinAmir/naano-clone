# Asset credits

## Photos

Downloaded (not hotlinked) and self-hosted under `public/images/`.

- `avatars/*.jpg` — portrait photos via [i.pravatar.cc](https://pravatar.cc), a free placeholder-avatar service built on real, freely-licensed portrait photography. Used for the three demo creator personas (Alexis, Marcus, Juliette) — not real people, purely placeholder art for a fictional demo.
- `banners/*.jpg`, `marketing/hero-bg.jpg` — via [Picsum Photos](https://picsum.photos), whose image library is sourced from [Unsplash](https://unsplash.com) and is free to use without attribution. Specific photo IDs: 1015, 1043, 1059, 1067 (picsum.photos/id/{id}).

Note: Unsplash's own `source.unsplash.com` random-photo endpoint (the "free source" originally planned) was deprecated and now returns errors; Picsum Photos is Unsplash-sourced and was used instead as a working equivalent. No official Unsplash API key was available in this environment to query their API directly.

## Video

The marketing hero does **not** use a background video in this build. Sourcing a real Pexels/Coverr clip requires either an API key (Pexels) or scraping a page for a direct CDN link (fragile, ToS-questionable) — neither was available here. Instead, the hero uses an animated CSS/Motion gradient background (see `.ambient-backdrop` in `globals.css` and the marketing hero section), which fits the dark-glass aesthetic without an external dependency. Revisit with a real licensed clip once a Pexels API key is available.

## Logos

`logos/ferngrove.svg`, `logos/bramble.svg`, `logos/northloop.svg`, `logos/naano-mark.svg` are hand-authored placeholder monograms for fictional demo brands — not real company logos.

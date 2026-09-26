# Naano

A B2B LinkedIn creator marketplace (a clone of naano.com). Brands find and book
LinkedIn creators for sponsored posts; creators publish a card, apply to briefs
and track earnings. Next.js 16 (App Router) + Supabase + Tailwind v4.

> **Status: internal-testing build.** All money is simulated — no payments
> gateway is connected. See [docs/INTERNAL-TESTING.md](docs/INTERNAL-TESTING.md)
> for test accounts, a walkthrough and known limitations.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in the two Supabase values
pnpm dev                     # http://localhost:3000
```

Environment (`.env.local`, see `.env.example`):

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key. Row Level Security is the only security boundary — **no service-role key is used anywhere.** |

### Database

Apply every file in `supabase/migrations/` **in order** (Supabase dashboard →
SQL editor). `0001` creates the schema and RLS; later files add integrity
rules, RPCs, direct conversations, campaign deadlines and notifications.

### Auth settings (Supabase dashboard → Authentication)

- **URL Configuration:** add your site URL(s) and `<site>/auth/callback` to the
  redirect allow-list (e.g. `http://localhost:3000/auth/callback` and your
  Vercel URL). Password-reset and email-confirmation links depend on it.
- **Confirm email:** on = testers must click an emailed link after sign-up;
  off = instant sign-in.

### Demo data

```bash
node scripts/seed-demo.mjs
```

Creates 3 creators and 3 brands with campaigns, collaborations, messages,
analytics and earnings. Every seeded account uses the password `12345678`.
Re-runnable. **Never run it against a production project.** Optional:
`scripts/demo-due-dates.sql` sets due dates on the seeded collaborations.

## Scripts

```bash
pnpm dev     # dev server
pnpm lint    # eslint (must be clean)
pnpm build   # production build (also typechecks)
```

## Project layout

- `src/app/` — routes: marketing (`/`, `/pricing`), auth, public creator cards
  (`/creators/[handle]`), and the `dashboard/creator` and `dashboard/brand` areas
- `src/components/ui/` — shared design-system components (reuse before building page-specific ones)
- `src/lib/actions/` — server actions (all writes); `src/lib/supabase/` — clients
- `docs/design/DESIGN.md` — the design system every screen follows
- `supabase/migrations/` — schema, RLS and RPCs

## Deploying (Vercel)

Set the two `NEXT_PUBLIC_SUPABASE_*` variables, apply all migrations, and add
the deployed URL to Supabase's auth redirect allow-list.

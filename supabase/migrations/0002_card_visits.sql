-- Phase 3 — deal-link visit tracking. Every view of a public creator card
-- (/creators/[handle]) logs a row here, regardless of who's viewing —
-- that's the data trail the 25%-for-3-months attribution mechanic is meant
-- to build toward in a later phase (matching a brand's eventual signup back
-- to the card that sent them).
--
-- Run this in the Supabase SQL Editor same as 0001_init.sql.

create table public.card_visits (
  id uuid primary key default gen_random_uuid(),
  creator_card_id uuid not null references public.creator_cards (id) on delete cascade,
  visited_at timestamptz not null default now()
);

alter table public.card_visits enable row level security;

-- Visits come from anonymous public traffic — anyone (including
-- unauthenticated visitors) can log one. There's nothing sensitive in the
-- row itself (no IP/user-agent captured), so this is a safe insert-only
-- policy with no ownership check.
create policy "card_visits: anyone can log a visit" on public.card_visits
  for insert with check (true);

create policy "card_visits: card owner can select" on public.card_visits
  for select using (
    exists (
      select 1 from public.creator_cards cc
      where cc.id = card_visits.creator_card_id
        and cc.creator_profile_id = auth.uid()
    )
  );

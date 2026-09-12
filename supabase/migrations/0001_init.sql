-- Naano clone — Phase 2 initial schema + RLS
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> paste -> Run).
-- Mirrors the schema sketch in the project plan (see /Users/mc/.claude/plans),
-- translated into real DDL with RLS enforced from the first migration, per
-- the plan's security section.

-- gen_random_uuid() / gen_random_bytes() come from pgcrypto. Supabase
-- projects usually have it enabled already; this is a no-op if so.
create extension if not exists pgcrypto;

-- ============================================================================
-- Enums
-- ============================================================================

create type public.app_role as enum ('creator', 'brand', 'admin');
create type public.plan_tier as enum ('self_serve', 'managed');
create type public.campaign_status as enum ('draft', 'published', 'closed');
create type public.collaboration_status as enum ('applied', 'needs_action', 'active', 'declined', 'completed');
create type public.earnings_type as enum ('collaboration_payout', 'affiliate_reward', 'referral_bonus');
create type public.earnings_status as enum ('pending', 'in_transit', 'available', 'withdrawn');
create type public.payout_method_type as enum ('bank_transfer', 'stripe_connect');
create type public.referral_type as enum ('invite_brand', 'invite_creator');
create type public.referral_status as enum ('pending', 'activated', 'rewarded', 'expired');
create type public.analytics_source as enum ('manual_entry', 'csv_upload');

-- ============================================================================
-- profiles — one row per auth.users row. Kept minimal/private (holds email);
-- public-facing display fields (name, avatar) are denormalized onto
-- creator_profiles/brand_profiles so public reads never need this table.
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  email text not null,
  locale text not null default 'en' check (locale in ('en', 'fr')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner can select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: owner can insert own row" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: owner can update own row" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================================
-- creator_profiles
-- ============================================================================

create table public.creator_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  handle text not null unique,
  display_name text not null,
  avatar_url text not null default '',
  headline text not null default '',
  bio text not null default '',
  location text not null default '',
  category_tags text[] not null default '{}',
  follower_count integer not null default 0,
  is_marketplace_visible boolean generated always as (follower_count >= 1000) stored,
  linkedin_public_url text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- creator_cards (1:1 with creator_profiles)
-- Created here, before creator_profiles' RLS policies, because the
-- creator_profiles select policy below needs to reference this table.
-- ============================================================================

create table public.creator_cards (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null unique references public.creator_profiles (profile_id) on delete cascade,
  price_per_post numeric(10, 2) not null default 0,
  banner_url text not null default '',
  card_slug text not null unique,
  deal_link_token text not null unique default encode(gen_random_bytes(9), 'base64'),
  published_at timestamptz,
  share_percent integer not null default 25,
  reward_window_months integer not null default 3,
  sample_post_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Now enable RLS + policies for creator_profiles (creator_cards exists now).
alter table public.creator_profiles enable row level security;

create policy "creator_profiles: owner or published card is readable" on public.creator_profiles
  for select using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.creator_cards cc
      where cc.creator_profile_id = creator_profiles.profile_id
        and cc.published_at is not null
    )
  );

create policy "creator_profiles: owner can insert own row" on public.creator_profiles
  for insert with check (auth.uid() = profile_id);

create policy "creator_profiles: owner can update own row" on public.creator_profiles
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- creator_cards RLS + policies
alter table public.creator_cards enable row level security;

create policy "creator_cards: owner or published is readable" on public.creator_cards
  for select using (auth.uid() = creator_profile_id or published_at is not null);

create policy "creator_cards: owner can insert own row" on public.creator_cards
  for insert with check (auth.uid() = creator_profile_id);

create policy "creator_cards: owner can update own row" on public.creator_cards
  for update using (auth.uid() = creator_profile_id) with check (auth.uid() = creator_profile_id);

-- ============================================================================
-- brand_profiles
-- ============================================================================

create table public.brand_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  company_name text not null,
  logo_url text not null default '',
  industry text not null default '',
  plan_tier public.plan_tier not null default 'self_serve',
  created_at timestamptz not null default now()
);

alter table public.brand_profiles enable row level security;

create policy "brand_profiles: owner can select" on public.brand_profiles
  for select using (auth.uid() = profile_id);

create policy "brand_profiles: owner can insert own row" on public.brand_profiles
  for insert with check (auth.uid() = profile_id);

create policy "brand_profiles: owner can update own row" on public.brand_profiles
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ============================================================================
-- campaigns — brand_name/logo are denormalized onto collaborations (below)
-- so creators never need brand_profiles read access to see who they're
-- working with.
-- ============================================================================

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_profile_id uuid not null references public.brand_profiles (profile_id) on delete cascade,
  title text not null,
  brief_text text not null default '',
  budget numeric(10, 2) not null default 0,
  target_vertical text not null default '',
  status public.campaign_status not null default 'draft',
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "campaigns: owner or published is readable" on public.campaigns
  for select using (auth.uid() = brand_profile_id or status = 'published');

create policy "campaigns: owner can insert own row" on public.campaigns
  for insert with check (auth.uid() = brand_profile_id);

create policy "campaigns: owner can update own row" on public.campaigns
  for update using (auth.uid() = brand_profile_id) with check (auth.uid() = brand_profile_id);

-- ============================================================================
-- collaborations — brand_name/brand_logo_url denormalized for creator-side
-- reads without needing brand_profiles access.
-- ============================================================================

create table public.collaborations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete set null,
  campaign_title text not null default '',
  creator_profile_id uuid not null references public.creator_profiles (profile_id) on delete cascade,
  brand_profile_id uuid not null references public.brand_profiles (profile_id) on delete cascade,
  brand_name text not null default '',
  brand_logo_url text not null default '',
  status public.collaboration_status not null default 'applied',
  agreed_price numeric(10, 2) not null default 0,
  net_payout_to_creator numeric(10, 2) not null default 0,
  next_action_text text not null default '',
  due_date date,
  performance_snapshot jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.collaborations enable row level security;

create policy "collaborations: either party can select" on public.collaborations
  for select using (auth.uid() = creator_profile_id or auth.uid() = brand_profile_id);

create policy "collaborations: either party can insert" on public.collaborations
  for insert with check (auth.uid() = creator_profile_id or auth.uid() = brand_profile_id);

create policy "collaborations: either party can update" on public.collaborations
  for update
  using (auth.uid() = creator_profile_id or auth.uid() = brand_profile_id)
  with check (auth.uid() = creator_profile_id or auth.uid() = brand_profile_id);

-- ============================================================================
-- conversations / conversation_participants / messages
-- ============================================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid references public.collaborations (id) on delete set null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_profile_id uuid references public.profiles (id) on delete set null,
  body text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "conversations: participants can select" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id and cp.profile_id = auth.uid()
    )
  );

create policy "conversation_participants: participants can select the roster" on public.conversation_participants
  for select using (
    exists (
      select 1 from public.conversation_participants cp2
      where cp2.conversation_id = conversation_participants.conversation_id and cp2.profile_id = auth.uid()
    )
  );

create policy "conversation_participants: self can join own row" on public.conversation_participants
  for insert with check (auth.uid() = profile_id);

create policy "messages: participants can select" on public.messages
  for select using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid()
    )
  );

create policy "messages: participants can insert as themselves" on public.messages
  for insert with check (
    auth.uid() = sender_profile_id
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid()
    )
  );

-- ============================================================================
-- earnings_ledger / payout_methods
-- NOTE: writes are scoped to the owning creator for now (no service-role key
-- configured yet). This is acceptable because Phase 1 explicitly keeps
-- earnings a simulated ledger — no real money ever moves. Once the
-- affiliate/completion integrity rules from the project plan's security
-- section are implemented, replace owner-writes with a SECURITY DEFINER RPC
-- function so a client can't fabricate a payout by inserting rows directly.
-- ============================================================================

create table public.earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles (profile_id) on delete cascade,
  collaboration_id uuid references public.collaborations (id) on delete set null,
  amount numeric(10, 2) not null default 0,
  type public.earnings_type not null,
  status public.earnings_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payout_methods (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles (profile_id) on delete cascade,
  method_type public.payout_method_type not null,
  bank_account_holder text,
  bank_last_four text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.earnings_ledger enable row level security;
alter table public.payout_methods enable row level security;

create policy "earnings_ledger: owner can select" on public.earnings_ledger
  for select using (auth.uid() = creator_profile_id);

create policy "earnings_ledger: owner can insert own rows" on public.earnings_ledger
  for insert with check (auth.uid() = creator_profile_id);

create policy "earnings_ledger: owner can update own rows" on public.earnings_ledger
  for update using (auth.uid() = creator_profile_id) with check (auth.uid() = creator_profile_id);

create policy "payout_methods: owner can select" on public.payout_methods
  for select using (auth.uid() = creator_profile_id);

create policy "payout_methods: owner can insert own rows" on public.payout_methods
  for insert with check (auth.uid() = creator_profile_id);

create policy "payout_methods: owner can update own rows" on public.payout_methods
  for update using (auth.uid() = creator_profile_id) with check (auth.uid() = creator_profile_id);

-- ============================================================================
-- affiliate_referrals
-- NOTE: activation_event_at / status transitions should only ever be written
-- by a trusted server-side path once the real "first completed paid
-- collaboration" trigger is implemented (Phase 8 in the roadmap) — not by
-- direct client update. Only insert/select-own is enabled for now.
-- ============================================================================

create table public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_profile_id uuid not null references public.profiles (id) on delete cascade,
  referred_profile_id uuid references public.profiles (id) on delete set null,
  referral_type public.referral_type not null,
  referral_code text not null unique,
  status public.referral_status not null default 'pending',
  activation_event_at timestamptz,
  reward_window_ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.affiliate_referrals enable row level security;

create policy "affiliate_referrals: referrer can select own" on public.affiliate_referrals
  for select using (auth.uid() = referrer_profile_id);

create policy "affiliate_referrals: referrer can insert own" on public.affiliate_referrals
  for insert with check (auth.uid() = referrer_profile_id);

-- ============================================================================
-- linkedin_analytics_snapshots / linkedin_posts
-- Manual entry / CSV upload only, per the project's decision to never scrape
-- LinkedIn (ToS/legal risk) — see the "source" enum, which has no scraping
-- value.
-- ============================================================================

create table public.linkedin_analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles (profile_id) on delete cascade,
  captured_at timestamptz not null default now(),
  public_post_reach integer,
  public_posts_count integer not null default 0,
  public_engagements integer not null default 0,
  follower_count integer,
  pct_posts_with_reach_data numeric(5, 2) not null default 0,
  source public.analytics_source,
  raw_payload jsonb not null default '{}'
);

create table public.linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.creator_profiles (profile_id) on delete cascade,
  original_post_url text not null,
  posted_at timestamptz not null,
  reach integer,
  engagements integer not null default 0,
  has_reach_data boolean not null default false
);

alter table public.linkedin_analytics_snapshots enable row level security;
alter table public.linkedin_posts enable row level security;

create policy "linkedin_analytics_snapshots: owner can select" on public.linkedin_analytics_snapshots
  for select using (auth.uid() = creator_profile_id);

create policy "linkedin_analytics_snapshots: owner can insert own rows" on public.linkedin_analytics_snapshots
  for insert with check (auth.uid() = creator_profile_id);

create policy "linkedin_posts: owner can select" on public.linkedin_posts
  for select using (auth.uid() = creator_profile_id);

create policy "linkedin_posts: owner can insert own rows" on public.linkedin_posts
  for insert with check (auth.uid() = creator_profile_id);

-- ============================================================================
-- notifications — table exists for future phases; no insert policy yet since
-- inserting a notification *for someone else* needs either a service-role
-- key or a SECURITY DEFINER function, neither of which exist yet.
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: owner can select" on public.notifications
  for select using (auth.uid() = profile_id);

create policy "notifications: owner can mark read" on public.notifications
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ============================================================================
-- marketplace_creators — the brand-facing "Match" search surface. Requires
-- BOTH a published card AND the 1,000-follower marketplace threshold, so a
-- brand can never discover a below-threshold creator through Match even if
-- they already know a handle (that path is the creator_profiles policy
-- above, which is intentionally looser for direct-link sharing).
-- security_invoker means this view still enforces the underlying tables'
-- RLS for whoever queries it, on top of its own WHERE clause.
-- ============================================================================

create view public.marketplace_creators
  with (security_invoker = true) as
  select cp.*
  from public.creator_profiles cp
  join public.creator_cards cc on cc.creator_profile_id = cp.profile_id
  where cc.published_at is not null
    and cp.is_marketplace_visible = true;

grant select on public.marketplace_creators to anon, authenticated;
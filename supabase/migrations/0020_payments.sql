-- Brand-funded escrow via Safepay.
--
-- Flow: a deal is accepted -> `pending_payment`; the brand pays price + platform
-- fee through Safepay checkout; the server verifies the payment with Safepay and
-- calls apply_payment_success(), which marks the payment paid and moves the deal
-- to `active` in one transaction. Only the server (service role) can create or
-- change payments — there are no insert/update policies for users.
--
-- Run 0019 first. Apply this whole file in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Settings and columns
-- ---------------------------------------------------------------------------

create table if not exists public.platform_settings (
  id boolean primary key default true check (id),
  fee_percent numeric(5,2) not null default 10 check (fee_percent >= 0 and fee_percent <= 50)
);
insert into public.platform_settings (id) values (true) on conflict (id) do nothing;
alter table public.platform_settings enable row level security;
drop policy if exists "platform_settings: signed-in users can read" on public.platform_settings;
create policy "platform_settings: signed-in users can read" on public.platform_settings
  for select to authenticated using (true);

alter table public.collaborations add column if not exists funded_at timestamptz;

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations (id) on delete restrict,
  brand_profile_id uuid not null references public.profiles (id) on delete restrict,
  order_id text not null unique,          -- our reference, sent to Safepay
  tracker text unique,                    -- Safepay's payment token
  price numeric(12,2) not null check (price > 0),
  platform_fee numeric(12,2) not null check (platform_fee >= 0),
  gross_amount numeric(12,2) not null check (gross_amount = price + platform_fee),
  currency text not null check (currency in ('USD', 'PKR')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  paid_at timestamptz,
  raw jsonb not null default '{}',        -- last verified Safepay payload, for audit
  created_at timestamptz not null default now()
);

create unique index if not exists payments_one_paid_per_collaboration
  on public.payments (collaboration_id) where status = 'paid';
create index if not exists payments_brand_created_idx on public.payments (brand_profile_id, created_at desc);

alter table public.payments enable row level security;
drop policy if exists "payments: brand can read own" on public.payments;
create policy "payments: brand can read own" on public.payments
  for select to authenticated using (auth.uid() = brand_profile_id);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,        -- makes webhook retries idempotent
  tracker text,
  source text not null,                   -- 'webhook' | 'redirect'
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.payment_events enable row level security;   -- no policies: server only

-- ---------------------------------------------------------------------------
-- Settling a verified payment (called only by the server with the service role)
-- ---------------------------------------------------------------------------

create or replace function public.apply_payment_success(
  p_tracker text, p_amount numeric, p_currency text, p_payload jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_pay public.payments;
begin
  select * into v_pay from public.payments where tracker = p_tracker for update;
  if v_pay.id is null then
    raise exception 'Unknown payment';
  end if;
  if v_pay.status = 'paid' then
    return;  -- webhook + redirect both settle; the second one is a no-op
  end if;
  if p_currency is distinct from v_pay.currency or p_amount is distinct from v_pay.gross_amount then
    raise exception 'Amount mismatch: expected % %, got % %', v_pay.gross_amount, v_pay.currency, p_amount, p_currency;
  end if;

  update public.payments set status = 'paid', paid_at = now(), raw = coalesce(p_payload, '{}') where id = v_pay.id;

  update public.collaborations
     set status = 'active', funded_at = now(), next_action_text = 'Publish your post'
   where id = v_pay.collaboration_id and status = 'pending_payment';
end;
$$;

revoke execute on function public.apply_payment_success(text, numeric, text, jsonb) from public, anon, authenticated;
grant execute on function public.apply_payment_success(text, numeric, text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Accepting a deal now leads to payment, not straight to work.
-- (Replaces update_collaboration_status from 0011; only accept/decline change.)
-- ---------------------------------------------------------------------------

create or replace function public.update_collaboration_status(p_collaboration_id uuid, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
  v_is_creator boolean;
  v_is_brand boolean;
  v_next_status public.collaboration_status;
  v_next_action_text text;
begin
  if p_action not in ('accept', 'decline', 'complete') then
    raise exception 'Invalid action';
  end if;

  select id, status, creator_profile_id, brand_profile_id, agreed_price
    into v_collab
    from public.collaborations
    where id = p_collaboration_id;

  if v_collab is null then
    raise exception 'Collaboration not found';
  end if;

  v_is_creator := auth.uid() = v_collab.creator_profile_id;
  v_is_brand := auth.uid() = v_collab.brand_profile_id;
  if not v_is_creator and not v_is_brand then
    raise exception 'You are not part of this collaboration';
  end if;

  if p_action = 'accept' then
    if (v_collab.status = 'applied' and v_is_brand) or (v_collab.status = 'needs_action' and v_is_creator) then
      if v_collab.agreed_price > 0 then
        v_next_status := 'pending_payment'; v_next_action_text := 'Waiting for the brand to fund this deal';
      else
        v_next_status := 'active'; v_next_action_text := 'Publish your post';
      end if;
    else
      raise exception 'This collaboration cannot be accepted right now';
    end if;
  elsif p_action = 'decline' then
    if v_collab.status = 'applied' and v_is_brand then
      v_next_status := 'declined'; v_next_action_text := 'Declined by brand';
    elsif v_collab.status = 'needs_action' and v_is_creator then
      v_next_status := 'declined'; v_next_action_text := 'Declined by creator';
    elsif v_collab.status = 'pending_payment' and (v_is_brand or v_is_creator) then
      v_next_status := 'declined'; v_next_action_text := 'Cancelled before payment';
    else
      raise exception 'This collaboration cannot be declined right now';
    end if;
  else
    if v_collab.status = 'active' and v_is_creator then
      v_next_status := 'completed'; v_next_action_text := 'Marked as posted';
    else
      raise exception 'Only the creator can mark an active collaboration as posted';
    end if;
  end if;

  update public.collaborations
    set status = v_next_status, next_action_text = v_next_action_text
    where id = p_collaboration_id;
end;
$$;
revoke execute on function public.update_collaboration_status(uuid, text) from public, anon;
grant execute on function public.update_collaboration_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications for the payment steps (extends 0015's trigger function)
-- ---------------------------------------------------------------------------

create or replace function public.notify_collaboration_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_creator_name text;
  v_recipient uuid;
  v_type text;
begin
  if tg_op = 'INSERT' then
    if new.status = 'applied' then
      select display_name into v_creator_name from public.creator_profiles where profile_id = new.creator_profile_id;
      insert into public.notifications (profile_id, type, payload) values (
        new.brand_profile_id, 'application_received',
        jsonb_build_object('collaboration_id', new.id, 'campaign_title', new.campaign_title,
                           'creator_name', coalesce(v_creator_name, 'A creator'))
      );
    elsif new.status = 'needs_action' then
      insert into public.notifications (profile_id, type, payload) values (
        new.creator_profile_id, 'offer_received',
        jsonb_build_object('collaboration_id', new.id, 'campaign_title', new.campaign_title,
                           'brand_name', new.brand_name, 'price', new.agreed_price)
      );
    end if;
    return new;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  select display_name into v_creator_name from public.creator_profiles where profile_id = new.creator_profile_id;

  if new.status = 'pending_payment' then
    -- The brand is the one who has to act next.
    v_type := 'payment_required';
    v_recipient := new.brand_profile_id;
  elsif new.status = 'active' and old.status = 'pending_payment' then
    -- Payment landed; the creator can start.
    v_type := 'deal_funded';
    v_recipient := new.creator_profile_id;
  else
    v_type := case new.status
      when 'active' then 'collaboration_accepted'
      when 'declined' then 'collaboration_declined'
      when 'completed' then 'collaboration_completed'
      else null
    end;
    if v_type is null then
      return new;
    end if;
    if auth.uid() = new.creator_profile_id then
      v_recipient := new.brand_profile_id;
    else
      v_recipient := new.creator_profile_id;
    end if;
  end if;

  insert into public.notifications (profile_id, type, payload) values (
    v_recipient, v_type,
    jsonb_build_object('collaboration_id', new.id, 'campaign_title', new.campaign_title,
                       'brand_name', new.brand_name, 'creator_name', coalesce(v_creator_name, 'A creator'),
                       'price', new.agreed_price)
  );
  return new;
end;
$$;
revoke execute on function public.notify_collaboration_change() from public, anon, authenticated;

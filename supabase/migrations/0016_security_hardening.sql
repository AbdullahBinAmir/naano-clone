-- Security hardening found in the pre-launch audit. Additive only: no table
-- shapes change, and every path the app uses keeps working (all writes that
-- matter already go through SECURITY DEFINER RPCs).
--
--  1. Anyone could insert themselves into ANY conversation
--     ("conversation_participants: self can join own row"), which would let
--     them read that thread. Membership is only ever created by the RPCs
--     create_collaboration_conversation / create_direct_conversation /
--     ensure_naanobot_welcome, so the policy is simply removed.
--  2. SECURITY DEFINER functions were executable by `public`/`anon` (the
--     Postgres default). They all require auth.uid() anyway, but there is no
--     reason for a signed-out caller to reach them.
--  3. ensure_naanobot_welcome(creator) accepted any creator id from anyone.
--     It now requires the caller to be that creator or a party to a
--     collaboration with them.
--  4. Owners could edit server-controlled columns on their own rows: a brand
--     could set its own plan_tier, a creator could raise its affiliate
--     share_percent / reward window or rotate deal_link_token. Client requests
--     (auth.uid() not null) can no longer change these; the SQL editor and
--     service role (auth.uid() null) still can.

-- 1 ---------------------------------------------------------------------------
drop policy if exists "conversation_participants: self can join own row" on public.conversation_participants;

-- 2 ---------------------------------------------------------------------------
revoke execute on function public.is_conversation_participant(uuid) from public, anon;
revoke execute on function public.create_collaboration_conversation(uuid, uuid, uuid) from public, anon;
revoke execute on function public.ensure_naanobot_welcome(uuid) from public, anon;
revoke execute on function public.create_direct_conversation(uuid) from public, anon;
revoke execute on function public.update_collaboration_status(uuid, text) from public, anon;
revoke execute on function public.record_collaboration_payout(uuid) from public, anon;
revoke execute on function public.settle_pending_earnings() from public, anon;
revoke execute on function public.request_withdrawal(numeric) from public, anon;
revoke execute on function public.redeem_referral_code(text) from public, anon;
revoke execute on function public.activate_referrals_for_completed_collaboration(uuid) from public, anon;
revoke execute on function public.check_collaboration_campaign_price() from public, anon, authenticated;

-- 3 ---------------------------------------------------------------------------
create or replace function public.ensure_naanobot_welcome(p_creator_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  -- The creator themself, or a brand/creator pair that actually share a collaboration.
  if auth.uid() is distinct from p_creator_profile_id and not exists (
    select 1 from public.collaborations
    where creator_profile_id = p_creator_profile_id and brand_profile_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  if exists (
    select 1
    from public.conversation_participants cp
    join public.conversations conv on conv.id = cp.conversation_id
    where cp.profile_id = p_creator_profile_id
      and conv.is_system = true
  ) then
    return;
  end if;

  insert into public.conversations (collaboration_id, is_system)
  values (null, true)
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, profile_id)
  values (v_conversation_id, p_creator_profile_id);

  insert into public.messages (conversation_id, sender_profile_id, body, is_system)
  values (
    v_conversation_id,
    null,
    'Welcome to Naano! Your first booking just opened this thread — this is where booking-related updates will show up.',
    true
  );
end;
$$;

revoke execute on function public.ensure_naanobot_welcome(uuid) from public, anon;
grant execute on function public.ensure_naanobot_welcome(uuid) to authenticated;

-- 4 ---------------------------------------------------------------------------
create or replace function public.lock_brand_server_columns()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and new.plan_tier is distinct from old.plan_tier then
    raise exception 'The plan can only be changed by Naano';
  end if;
  return new;
end;
$$;

drop trigger if exists brand_profiles_lock_server_columns on public.brand_profiles;
create trigger brand_profiles_lock_server_columns
  before update on public.brand_profiles
  for each row execute function public.lock_brand_server_columns();

create or replace function public.lock_card_server_columns()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
    new.share_percent is distinct from old.share_percent
    or new.reward_window_months is distinct from old.reward_window_months
    or new.deal_link_token is distinct from old.deal_link_token
  ) then
    raise exception 'Affiliate settings can only be changed by Naano';
  end if;
  return new;
end;
$$;

drop trigger if exists creator_cards_lock_server_columns on public.creator_cards;
create trigger creator_cards_lock_server_columns
  before update on public.creator_cards
  for each row execute function public.lock_card_server_columns();

revoke execute on function public.lock_brand_server_columns() from public, anon, authenticated;
revoke execute on function public.lock_card_server_columns() from public, anon, authenticated;

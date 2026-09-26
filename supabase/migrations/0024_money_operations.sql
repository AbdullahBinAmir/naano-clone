-- Money operations: disputes, refunds, auto-approval, unpaid-deal expiry and
-- the admin payout queue for real bank transfers.
--
--  * Admins are ordinary profiles with role = 'admin', set by hand in the SQL
--    editor:  update public.profiles set role = 'admin' where email = '...';
--    Every admin action below is a SECURITY DEFINER function that re-checks
--    is_admin(); the admin screens additionally read with the server-only
--    service role after checking the role.
--  * Refunds are RECORDED here; the money itself is returned from the Safepay
--    dashboard by an admin (Safepay's refund API isn't wired up).
--  * Cron jobs (auto-approve, expire-unpaid) call service-role-only functions.
--
-- Run 0023 first. Apply this whole file in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Settings, columns, helper
-- ---------------------------------------------------------------------------

alter table public.platform_settings
  add column if not exists auto_approve_days int not null default 5 check (auto_approve_days between 1 and 60),
  add column if not exists unpaid_expiry_days int not null default 3 check (unpaid_expiry_days between 1 and 60),
  add column if not exists min_payout numeric(12,2) not null default 10 check (min_payout >= 0);

alter table public.collaborations add column if not exists payment_requested_at timestamptz;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Remember when a deal started waiting for payment (drives the expiry job).
create or replace function public.set_payment_requested_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'pending_payment' and old.status is distinct from 'pending_payment' then
    new.payment_requested_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists collaborations_set_payment_requested_at on public.collaborations;
create trigger collaborations_set_payment_requested_at
  before update of status on public.collaborations
  for each row execute function public.set_payment_requested_at();
revoke execute on function public.set_payment_requested_at() from public, anon, authenticated;

-- payments can now be refunded
alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check
  check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded'));
alter table public.payments
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_reference text;

-- ---------------------------------------------------------------------------
-- Shared payout release (internal; not granted to anyone)
-- ---------------------------------------------------------------------------

create or replace function public._release_payout(p_collaboration_id uuid, p_action_text text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, creator_profile_id, net_payout_to_creator into v_collab
    from public.collaborations where id = p_collaboration_id for update;

  update public.collaborations
     set status = 'completed', approved_at = now(), next_action_text = p_action_text
   where id = p_collaboration_id;

  if v_collab.net_payout_to_creator > 0 and not exists (
    select 1 from public.earnings_ledger where collaboration_id = v_collab.id and type = 'collaboration_payout'
  ) then
    insert into public.earnings_ledger (creator_profile_id, collaboration_id, amount, type, status)
    values (v_collab.creator_profile_id, v_collab.id, v_collab.net_payout_to_creator, 'collaboration_payout', 'available');
  end if;
end;
$$;
revoke execute on function public._release_payout(uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Automation (service role only, called by the daily cron route)
-- ---------------------------------------------------------------------------

create or replace function public.auto_approve_due_collaborations()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_days int;
  v_id uuid;
  v_count int := 0;
begin
  select auto_approve_days into v_days from public.platform_settings limit 1;
  for v_id in
    select id from public.collaborations
    where status = 'in_review' and submitted_at < now() - make_interval(days => v_days)
  loop
    perform public._release_payout(v_id, format('Auto-approved after %s days without a review', v_days));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.expire_unpaid_collaborations()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_days int;
  v_id uuid;
  v_count int := 0;
begin
  select unpaid_expiry_days into v_days from public.platform_settings limit 1;
  for v_id in
    select id from public.collaborations
    where status = 'pending_payment' and payment_requested_at < now() - make_interval(days => v_days)
  loop
    update public.collaborations
       set status = 'declined', next_action_text = 'Cancelled: payment was not received in time'
     where id = v_id;
    update public.payments set status = 'cancelled' where collaboration_id = v_id and status = 'pending';
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke execute on function public.auto_approve_due_collaborations() from public, anon, authenticated;
revoke execute on function public.expire_unpaid_collaborations() from public, anon, authenticated;
grant execute on function public.auto_approve_due_collaborations() to service_role;
grant execute on function public.expire_unpaid_collaborations() to service_role;

-- ---------------------------------------------------------------------------
-- Disputes
-- ---------------------------------------------------------------------------

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.collaborations (id) on delete restrict,
  opened_by uuid not null references public.profiles (id) on delete restrict,
  reason text not null check (char_length(reason) between 10 and 1000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolution text check (resolution in ('release', 'refund')),
  resolution_note text,
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists disputes_one_open_per_collaboration
  on public.disputes (collaboration_id) where status = 'open';

alter table public.disputes enable row level security;
drop policy if exists "disputes: parties can read" on public.disputes;
create policy "disputes: parties can read" on public.disputes
  for select to authenticated
  using (exists (
    select 1 from public.collaborations c
    where c.id = disputes.collaboration_id and auth.uid() in (c.creator_profile_id, c.brand_profile_id)
  ));

create or replace function public.open_dispute(p_collaboration_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, status, creator_profile_id, brand_profile_id, funded_at into v_collab
    from public.collaborations where id = p_collaboration_id for update;
  if v_collab is null then raise exception 'Collaboration not found'; end if;
  if auth.uid() is distinct from v_collab.creator_profile_id and auth.uid() is distinct from v_collab.brand_profile_id then
    raise exception 'You are not part of this collaboration';
  end if;
  if v_collab.funded_at is null or v_collab.status not in ('active', 'in_review') then
    raise exception 'A dispute can only be opened on a paid deal that is in progress';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) < 10 then
    raise exception 'Please describe the problem in at least 10 characters';
  end if;

  insert into public.disputes (collaboration_id, opened_by, reason) values (p_collaboration_id, auth.uid(), left(trim(p_reason), 1000));
  update public.collaborations set status = 'disputed', next_action_text = 'Under review by Naano' where id = p_collaboration_id;
end;
$$;
revoke execute on function public.open_dispute(uuid, text) from public, anon;
grant execute on function public.open_dispute(uuid, text) to authenticated;

-- Admin: settle a dispute by paying the creator or refunding the brand.
create or replace function public.resolve_dispute(p_dispute_id uuid, p_resolution text, p_note text, p_refund_reference text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_dispute record;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_resolution not in ('release', 'refund') then raise exception 'Invalid resolution'; end if;

  select * into v_dispute from public.disputes where id = p_dispute_id for update;
  if v_dispute is null then raise exception 'Dispute not found'; end if;
  if v_dispute.status <> 'open' then raise exception 'This dispute is already resolved'; end if;

  if p_resolution = 'release' then
    perform public._release_payout(v_dispute.collaboration_id, 'Dispute resolved — payout released to the creator');
  else
    update public.collaborations set status = 'refunded', next_action_text = 'Dispute resolved — brand refunded' where id = v_dispute.collaboration_id;
    update public.payments
       set status = 'refunded', refunded_at = now(), refund_reference = nullif(trim(coalesce(p_refund_reference, '')), '')
     where collaboration_id = v_dispute.collaboration_id and status = 'paid';
  end if;

  update public.disputes
     set status = 'resolved', resolution = p_resolution, resolution_note = nullif(trim(coalesce(p_note, '')), ''),
         resolved_by = auth.uid(), resolved_at = now()
   where id = p_dispute_id;
end;
$$;
revoke execute on function public.resolve_dispute(uuid, text, text, text) from public, anon;
grant execute on function public.resolve_dispute(uuid, text, text, text) to authenticated;

-- Admin: refund a paid deal outside a dispute (e.g. the creator went silent).
create or replace function public.admin_refund_collaboration(p_collaboration_id uuid, p_note text, p_refund_reference text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  select id, status, funded_at into v_collab from public.collaborations where id = p_collaboration_id for update;
  if v_collab is null then raise exception 'Collaboration not found'; end if;
  if v_collab.funded_at is null or v_collab.status not in ('active', 'in_review', 'disputed') then
    raise exception 'Only a paid deal that has not been completed can be refunded';
  end if;

  update public.collaborations
     set status = 'refunded', next_action_text = coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Refunded to the brand')
   where id = p_collaboration_id;
  update public.payments
     set status = 'refunded', refunded_at = now(), refund_reference = nullif(trim(coalesce(p_refund_reference, '')), '')
   where collaboration_id = p_collaboration_id and status = 'paid';
  update public.disputes
     set status = 'resolved', resolution = 'refund', resolution_note = 'Refunded by an admin', resolved_by = auth.uid(), resolved_at = now()
   where collaboration_id = p_collaboration_id and status = 'open';
end;
$$;
revoke execute on function public.admin_refund_collaboration(uuid, text, text) from public, anon;
grant execute on function public.admin_refund_collaboration(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Bank details and the payout queue
-- ---------------------------------------------------------------------------

alter table public.payout_methods
  add column if not exists bank_name text,
  add column if not exists account_number text;   -- IBAN / account number; readable only by the owner (and the server for admins)

create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.profiles (id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD',
  status text not null default 'requested' check (status in ('requested', 'processing', 'paid', 'failed')),
  -- Snapshot of where to send the money, so later edits can't redirect a queued payout.
  account_holder text not null,
  bank_name text not null,
  account_number text not null,
  admin_id uuid references public.profiles (id),
  reference text,          -- bank transfer reference, entered when marked paid
  admin_note text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists payout_requests_status_idx on public.payout_requests (status, requested_at);
create index if not exists payout_requests_creator_idx on public.payout_requests (creator_profile_id, requested_at desc);

alter table public.payout_requests enable row level security;
drop policy if exists "payout_requests: creator can read own" on public.payout_requests;
create policy "payout_requests: creator can read own" on public.payout_requests
  for select to authenticated using (auth.uid() = creator_profile_id);

-- The only way to withdraw is now a payout request (request_withdrawal stays as
-- an internal helper that request_payout calls).
create or replace function public.request_payout(p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_min numeric;
  v_method record;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select min_payout into v_min from public.platform_settings limit 1;
  if p_amount is null or p_amount < coalesce(v_min, 0) then
    raise exception 'The minimum payout is %', coalesce(v_min, 0);
  end if;

  select bank_account_holder, bank_name, account_number into v_method
    from public.payout_methods
    where creator_profile_id = auth.uid() and method_type = 'bank_transfer' and is_active
    limit 1;
  if v_method is null or coalesce(v_method.bank_name, '') = '' or coalesce(v_method.account_number, '') = ''
     or coalesce(v_method.bank_account_holder, '') = '' then
    raise exception 'Add your bank details before requesting a payout';
  end if;

  perform public.request_withdrawal(p_amount);   -- checks the balance and debits the ledger

  insert into public.payout_requests (creator_profile_id, amount, account_holder, bank_name, account_number)
  values (auth.uid(), p_amount, v_method.bank_account_holder, v_method.bank_name, v_method.account_number);
end;
$$;
revoke execute on function public.request_payout(numeric) from public, anon;
grant execute on function public.request_payout(numeric) to authenticated;
revoke execute on function public.request_withdrawal(numeric) from public, anon, authenticated;

-- Admin: move a payout request along.
create or replace function public.admin_set_payout_status(p_request_id uuid, p_status text, p_reference text, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req record;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_status not in ('processing', 'paid', 'failed') then raise exception 'Invalid status'; end if;

  select * into v_req from public.payout_requests where id = p_request_id for update;
  if v_req is null then raise exception 'Payout request not found'; end if;
  if v_req.status in ('paid', 'failed') then raise exception 'This payout is already closed'; end if;
  if p_status = 'processing' and v_req.status <> 'requested' then raise exception 'This payout is already being processed'; end if;
  if p_status = 'paid' and char_length(trim(coalesce(p_reference, ''))) = 0 then raise exception 'Enter the bank transfer reference'; end if;
  if p_status = 'failed' and char_length(trim(coalesce(p_note, ''))) = 0 then raise exception 'Say why the payout failed'; end if;

  update public.payout_requests
     set status = p_status, admin_id = auth.uid(),
         reference = coalesce(nullif(trim(coalesce(p_reference, '')), ''), reference),
         admin_note = coalesce(nullif(trim(coalesce(p_note, '')), ''), admin_note),
         processed_at = case when p_status in ('paid', 'failed') then now() else processed_at end
   where id = p_request_id;

  if p_status = 'failed' then
    -- Give the money back to the creator's balance.
    insert into public.earnings_ledger (creator_profile_id, amount, type, status)
    values (v_req.creator_profile_id, v_req.amount, 'payout_reversal', 'available');
  end if;

  if p_status in ('paid', 'failed') then
    insert into public.notifications (profile_id, type, payload) values (
      v_req.creator_profile_id,
      case p_status when 'paid' then 'payout_paid' else 'payout_failed' end,
      jsonb_build_object('amount', v_req.amount, 'reference', nullif(trim(coalesce(p_reference, '')), ''), 'note', nullif(trim(coalesce(p_note, '')), ''))
    );
  end if;
end;
$$;
revoke execute on function public.admin_set_payout_status(uuid, text, text, text) from public, anon;
grant execute on function public.admin_set_payout_status(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications (extends the trigger from 0022 with dispute / refund steps)
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

  -- Steps that concern both parties: one notification each.
  if new.status in ('refunded') or (old.status = 'disputed' and new.status = 'completed')
     or (new.status = 'declined' and old.status = 'pending_payment' and auth.uid() is null) then
    v_type := case
      when new.status = 'refunded' then 'deal_refunded'
      when new.status = 'completed' then 'dispute_resolved_release'
      else 'payment_expired'
    end;
    insert into public.notifications (profile_id, type, payload)
    select p, v_type, jsonb_build_object('collaboration_id', new.id, 'campaign_title', new.campaign_title,
             'brand_name', new.brand_name, 'creator_name', coalesce(v_creator_name, 'A creator'), 'price', new.agreed_price)
      from unnest(array[new.brand_profile_id, new.creator_profile_id]) as p;
    return new;
  end if;

  if new.status = 'disputed' then
    v_type := 'dispute_opened';
    v_recipient := case when auth.uid() = new.creator_profile_id then new.brand_profile_id else new.creator_profile_id end;
  elsif new.status = 'pending_payment' then
    v_type := 'payment_required'; v_recipient := new.brand_profile_id;
  elsif new.status = 'active' and old.status = 'pending_payment' then
    v_type := 'deal_funded'; v_recipient := new.creator_profile_id;
  elsif new.status = 'in_review' then
    v_type := 'post_submitted'; v_recipient := new.brand_profile_id;
  elsif new.status = 'completed' and old.status = 'in_review' then
    v_type := 'post_approved'; v_recipient := new.creator_profile_id;
  elsif new.status = 'active' and old.status = 'in_review' then
    v_type := 'revision_requested'; v_recipient := new.creator_profile_id;
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
                       'price', new.agreed_price, 'note', new.revision_note)
  );
  return new;
end;
$$;
revoke execute on function public.notify_collaboration_change() from public, anon, authenticated;

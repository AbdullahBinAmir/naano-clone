-- Phase 7: earnings ledger goes real. Money stays simulated indefinitely
-- (no real payment processor is ever integrated) but the state machine
-- becomes real database operations instead of a demo-data stub.
--
-- This closes the integrity gap flagged in 0001_init.sql's earnings_ledger
-- comment: client-side owner-insert/update let any signed-in creator
-- fabricate an arbitrary payout by inserting rows directly. All writes now
-- go exclusively through SECURITY DEFINER RPCs that re-derive amounts from
-- trusted server-side state (the collaboration's own net_payout_to_creator,
-- or the caller's own existing available rows) rather than trusting
-- client-supplied amounts.

drop policy if exists "earnings_ledger: owner can insert own rows" on public.earnings_ledger;
drop policy if exists "earnings_ledger: owner can update own rows" on public.earnings_ledger;

-- Records the simulated payout for a collaboration once it's been marked
-- completed. Idempotent (checked via the collaboration_id + type guard) so
-- calling it more than once for the same collaboration is a no-op.
create or replace function public.record_collaboration_payout(p_collaboration_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, status, creator_profile_id, net_payout_to_creator
    into v_collab
    from public.collaborations
    where id = p_collaboration_id;

  if v_collab is null then
    raise exception 'Collaboration not found';
  end if;
  if auth.uid() is distinct from v_collab.creator_profile_id then
    raise exception 'Not authorized to record this payout';
  end if;
  if v_collab.status is distinct from 'completed' then
    raise exception 'Collaboration is not completed';
  end if;
  if exists (
    select 1 from public.earnings_ledger
    where collaboration_id = v_collab.id and type = 'collaboration_payout'
  ) then
    return;
  end if;

  insert into public.earnings_ledger (creator_profile_id, collaboration_id, amount, type, status)
  values (v_collab.creator_profile_id, v_collab.id, v_collab.net_payout_to_creator, 'collaboration_payout', 'in_transit');
end;
$$;
grant execute on function public.record_collaboration_payout(uuid) to authenticated;

-- Simulates transfer settlement: promotes the caller's own in_transit rows
-- to available once they've "been in transit" long enough. A short window
-- stands in for the real 1-7 day bank transfer naano.com describes, since
-- no real transfer ever happens — called opportunistically whenever the
-- creator loads their Earnings page.
create or replace function public.settle_pending_earnings()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.earnings_ledger
  set status = 'available'
  where creator_profile_id = auth.uid()
    and status = 'in_transit'
    and created_at < now() - interval '60 seconds';
end;
$$;
grant execute on function public.settle_pending_earnings() to authenticated;

-- Withdraws p_amount from the caller's own available balance, consuming
-- available rows oldest-first and splitting the row that would otherwise
-- overshoot so the withdrawn total is exact.
create or replace function public.request_withdrawal(p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_remaining numeric := p_amount;
  v_available numeric;
  v_row record;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero';
  end if;

  select coalesce(sum(amount), 0) into v_available
    from public.earnings_ledger
    where creator_profile_id = auth.uid() and status = 'available';

  if p_amount > v_available then
    raise exception 'Withdrawal amount exceeds your available balance';
  end if;

  for v_row in
    select id, amount, collaboration_id, type from public.earnings_ledger
    where creator_profile_id = auth.uid() and status = 'available'
    order by created_at asc
    for update
  loop
    exit when v_remaining <= 0;
    if v_row.amount <= v_remaining then
      update public.earnings_ledger set status = 'withdrawn' where id = v_row.id;
      v_remaining := v_remaining - v_row.amount;
    else
      insert into public.earnings_ledger (creator_profile_id, collaboration_id, amount, type, status)
      values (auth.uid(), v_row.collaboration_id, v_remaining, v_row.type, 'withdrawn');
      update public.earnings_ledger set amount = v_row.amount - v_remaining where id = v_row.id;
      v_remaining := 0;
    end if;
  end loop;
end;
$$;
grant execute on function public.request_withdrawal(numeric) to authenticated;

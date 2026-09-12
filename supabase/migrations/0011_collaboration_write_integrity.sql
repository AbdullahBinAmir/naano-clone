-- Security audit finding (pre-deploy): with only the anon/publishable key
-- ever configured (no service_role key), Postgres RLS is the ONLY real
-- access boundary — the Next.js app's own validation can always be
-- bypassed by calling Supabase's REST API directly with a valid user JWT.
-- Two real, exploitable gaps existed:
--
-- 1. "collaborations: either party can update" allowed a party to PATCH
--    any column on a collaboration they're part of, including jumping
--    `status` straight to 'completed' and setting `net_payout_to_creator`
--    to any value they liked — then calling the already-authenticated
--    record_collaboration_payout RPC to mint themselves a fabricated
--    earnings_ledger entry for that amount.
-- 2. The insert policy didn't check `status`, so the same forged-payout
--    path was reachable at INSERT time too (insert directly with
--    status = 'completed'), and nothing stopped a party from inserting a
--    status value that's only supposed to originate from the *other*
--    party (a creator inserting their own 'needs_action' row, i.e.
--    forging a brand's invite to themselves).
--
-- Fix: collaborations can now only ever be updated through the new
-- update_collaboration_status RPC below, which re-implements the exact
-- accept/decline/complete state machine from
-- src/lib/actions/collaborations.ts server-side. Direct client UPDATEs
-- are no longer permitted at all. INSERTs are restricted to the one
-- status each party is actually allowed to originate, party fields can't
-- both point at the caller (no self-dealing), and a trigger cross-checks
-- campaign-linked applications against the campaign's own budget/owner so
-- a creator can't apply at a self-chosen inflated price.

drop policy if exists "collaborations: either party can insert" on public.collaborations;
drop policy if exists "collaborations: either party can update" on public.collaborations;

create policy "collaborations: party can insert their own side" on public.collaborations
  for insert with check (
    net_payout_to_creator >= 0 and agreed_price >= 0
    and (
      (auth.uid() = creator_profile_id and auth.uid() is distinct from brand_profile_id and status = 'applied')
      or
      (auth.uid() = brand_profile_id and auth.uid() is distinct from creator_profile_id and status = 'needs_action')
    )
  );

create or replace function public.check_collaboration_campaign_price()
returns trigger language plpgsql as $$
declare
  v_campaign record;
begin
  if new.campaign_id is not null then
    select brand_profile_id, budget into v_campaign from public.campaigns where id = new.campaign_id;
    if v_campaign is null then
      raise exception 'Campaign not found';
    end if;
    if v_campaign.brand_profile_id is distinct from new.brand_profile_id then
      raise exception 'Campaign does not belong to this brand';
    end if;
    if new.agreed_price is distinct from v_campaign.budget or new.net_payout_to_creator is distinct from v_campaign.budget then
      raise exception 'Price must match the campaign budget';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists collaborations_check_campaign_price on public.collaborations;
create trigger collaborations_check_campaign_price
  before insert on public.collaborations
  for each row execute function public.check_collaboration_campaign_price();

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

  select id, status, creator_profile_id, brand_profile_id
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
    if v_collab.status = 'applied' and v_is_brand then
      v_next_status := 'active'; v_next_action_text := 'Publish your post';
    elsif v_collab.status = 'needs_action' and v_is_creator then
      v_next_status := 'active'; v_next_action_text := 'Publish your post';
    else
      raise exception 'This collaboration cannot be accepted right now';
    end if;
  elsif p_action = 'decline' then
    if v_collab.status = 'applied' and v_is_brand then
      v_next_status := 'declined'; v_next_action_text := 'Declined by brand';
    elsif v_collab.status = 'needs_action' and v_is_creator then
      v_next_status := 'declined'; v_next_action_text := 'Declined by creator';
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
grant execute on function public.update_collaboration_status(uuid, text) to authenticated;

-- Same class of bug on affiliate_referrals: nothing stopped a client from
-- inserting their own row with referred_profile_id already set (to
-- themselves, even), bypassing redeem_referral_code's self-referral and
-- role-match checks entirely.
drop policy if exists "affiliate_referrals: referrer can insert own" on public.affiliate_referrals;
create policy "affiliate_referrals: referrer can insert own" on public.affiliate_referrals
  for insert with check (auth.uid() = referrer_profile_id and referred_profile_id is null and status = 'pending');

-- profiles.role has no legitimate update path anywhere in the app (role is
-- chosen once at onboarding and the UI says as much: "This can't be
-- changed later"), so the owner-update policy existed only as a raw-REST
-- privilege-escalation surface — nothing stops a signed-in creator from
-- PATCHing their own row to role: 'admin' today. No feature currently
-- checks for that role, but there's no reason to leave the door open for
-- when one does. Dropped entirely; re-add scoped to specific columns
-- (locale, say) if a future phase needs self-service profile edits.
drop policy if exists "profiles: owner can update own row" on public.profiles;

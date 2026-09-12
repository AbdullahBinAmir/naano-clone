-- Phase 8: affiliate program goes real. Referral link generation stays a
-- plain client insert (already covered by the "referrer can insert own"
-- policy from 0001_init.sql — creating your own pending, unredeemed link
-- carries no fraud risk). What goes through SECURITY DEFINER RPCs instead,
-- per that migration's note, is everything that writes to a row the caller
-- doesn't own, or that marks a referral activated:
--
--   - redeem_referral_code: the REFERRED person (not the referrer) sets
--     referred_profile_id on the referrer's own row, so this can't be a
--     plain owner-scoped RLS write. Rejects self-referral and a
--     type/role mismatch (an invite_brand link redeemed by a creator, etc).
--   - activate_referrals_for_completed_collaboration: fires from a
--     specific completed collaboration, activates the referral for
--     whichever of its two parties (creator, brand) this was their first
--     ever completed — and only paid collaborations (payout > 0) can
--     activate a reward window, per the plan's fraud-control section.

create unique index if not exists affiliate_referrals_referrer_type_key
  on public.affiliate_referrals (referrer_profile_id, referral_type);

create or replace function public.redeem_referral_code(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_caller_role public.app_role;
  v_referral record;
begin
  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role is null then
    raise exception 'You need to sign in first';
  end if;

  select id, referrer_profile_id, referral_type, referred_profile_id
    into v_referral
    from public.affiliate_referrals
    where referral_code = p_code;

  if v_referral is null then
    raise exception 'Invalid referral code';
  end if;
  if v_referral.referred_profile_id is not null then
    raise exception 'This referral link has already been used';
  end if;
  if v_referral.referrer_profile_id = auth.uid() then
    raise exception 'You cannot redeem your own referral link';
  end if;
  if (v_referral.referral_type = 'invite_brand' and v_caller_role is distinct from 'brand')
     or (v_referral.referral_type = 'invite_creator' and v_caller_role is distinct from 'creator') then
    raise exception 'This referral link is for a different account type';
  end if;

  update public.affiliate_referrals set referred_profile_id = auth.uid() where id = v_referral.id;
end;
$$;
grant execute on function public.redeem_referral_code(text) to authenticated;

create or replace function public.activate_referrals_for_completed_collaboration(p_collaboration_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, status, creator_profile_id, brand_profile_id, net_payout_to_creator
    into v_collab
    from public.collaborations
    where id = p_collaboration_id;

  if v_collab is null then
    raise exception 'Collaboration not found';
  end if;
  if auth.uid() is distinct from v_collab.creator_profile_id and auth.uid() is distinct from v_collab.brand_profile_id then
    raise exception 'Not authorized for this collaboration';
  end if;
  if v_collab.status is distinct from 'completed' then
    raise exception 'Collaboration is not completed';
  end if;
  if v_collab.net_payout_to_creator <= 0 then
    return;
  end if;

  if (select count(*) from public.collaborations where creator_profile_id = v_collab.creator_profile_id and status = 'completed') = 1 then
    update public.affiliate_referrals
      set status = 'activated', activation_event_at = now(), reward_window_ends_at = now() + interval '3 months'
      where referred_profile_id = v_collab.creator_profile_id and referral_type = 'invite_creator' and status = 'pending';
  end if;

  if (select count(*) from public.collaborations where brand_profile_id = v_collab.brand_profile_id and status = 'completed') = 1 then
    update public.affiliate_referrals
      set status = 'activated', activation_event_at = now(), reward_window_ends_at = now() + interval '3 months'
      where referred_profile_id = v_collab.brand_profile_id and referral_type = 'invite_brand' and status = 'pending';
  end if;
end;
$$;
grant execute on function public.activate_referrals_for_completed_collaboration(uuid) to authenticated;

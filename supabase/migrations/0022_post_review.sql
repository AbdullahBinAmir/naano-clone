-- Post submission, brand approval and escrow release.
--
-- Money model: the brand's payment (0020) is held for the deal. When the brand
-- approves the post, the creator's agreed price (net_payout_to_creator) is
-- credited to their earnings ledger as available. Deals that were never funded
-- through Safepay (free deals and data from before payments) keep the older
-- one-step "mark as posted" path so existing data still works.
--
-- Run 0021 first. Apply this whole file in the Supabase SQL editor.

alter table public.collaborations
  add column if not exists post_url text,
  add column if not exists submitted_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists revision_note text;

-- ---------------------------------------------------------------------------
-- update_collaboration_status: 'complete' is now only for unfunded deals.
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

  select id, status, creator_profile_id, brand_profile_id, agreed_price, funded_at
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
    if v_collab.funded_at is not null then
      raise exception 'Submit your post link for the brand to review instead';
    end if;
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
-- Creator submits the published post for review
-- ---------------------------------------------------------------------------

create or replace function public.submit_collaboration_post(p_collaboration_id uuid, p_post_url text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, status, creator_profile_id, funded_at into v_collab from public.collaborations where id = p_collaboration_id;
  if v_collab is null then raise exception 'Collaboration not found'; end if;
  if auth.uid() is distinct from v_collab.creator_profile_id then raise exception 'Only the creator can submit the post'; end if;
  if v_collab.status is distinct from 'active' or v_collab.funded_at is null then
    raise exception 'This deal is not ready for a post submission';
  end if;
  if p_post_url !~* '^https://([a-z0-9-]+\.)?linkedin\.com/.+' then
    raise exception 'Enter the full LinkedIn post URL';
  end if;

  update public.collaborations
     set status = 'in_review', post_url = p_post_url, submitted_at = now(), revision_note = null,
         next_action_text = 'Waiting for the brand to review your post'
   where id = p_collaboration_id;
end;
$$;
revoke execute on function public.submit_collaboration_post(uuid, text) from public, anon;
grant execute on function public.submit_collaboration_post(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Brand approves: deal completes and the creator's payout is released
-- ---------------------------------------------------------------------------

create or replace function public.approve_collaboration(p_collaboration_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, status, creator_profile_id, brand_profile_id, net_payout_to_creator
    into v_collab from public.collaborations where id = p_collaboration_id for update;
  if v_collab is null then raise exception 'Collaboration not found'; end if;
  if auth.uid() is distinct from v_collab.brand_profile_id then raise exception 'Only the brand can approve the post'; end if;
  if v_collab.status is distinct from 'in_review' then raise exception 'There is no submitted post to approve'; end if;

  update public.collaborations
     set status = 'completed', approved_at = now(), next_action_text = 'Approved — payout released'
   where id = p_collaboration_id;

  -- Escrow release: credit the creator (once).
  if v_collab.net_payout_to_creator > 0 and not exists (
    select 1 from public.earnings_ledger where collaboration_id = v_collab.id and type = 'collaboration_payout'
  ) then
    insert into public.earnings_ledger (creator_profile_id, collaboration_id, amount, type, status)
    values (v_collab.creator_profile_id, v_collab.id, v_collab.net_payout_to_creator, 'collaboration_payout', 'available');
  end if;
end;
$$;
revoke execute on function public.approve_collaboration(uuid) from public, anon;
grant execute on function public.approve_collaboration(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Brand asks for changes: back to the creator
-- ---------------------------------------------------------------------------

create or replace function public.request_collaboration_revision(p_collaboration_id uuid, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_collab record;
begin
  select id, status, brand_profile_id into v_collab from public.collaborations where id = p_collaboration_id;
  if v_collab is null then raise exception 'Collaboration not found'; end if;
  if auth.uid() is distinct from v_collab.brand_profile_id then raise exception 'Only the brand can request changes'; end if;
  if v_collab.status is distinct from 'in_review' then raise exception 'There is no submitted post to review'; end if;
  if length(coalesce(trim(p_note), '')) = 0 then raise exception 'Tell the creator what to change'; end if;

  update public.collaborations
     set status = 'active', revision_note = left(trim(p_note), 500),
         next_action_text = 'Changes requested — update your post and resubmit'
   where id = p_collaboration_id;
end;
$$;
revoke execute on function public.request_collaboration_revision(uuid, text) from public, anon;
grant execute on function public.request_collaboration_revision(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications for the review steps (extends the trigger from 0020)
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

-- Real in-app notifications. The `notifications` table has existed since
-- 0001 with owner select / mark-read policies but nothing ever wrote to it,
-- because inserting a row for *someone else* can't be expressed as plain RLS.
-- These SECURITY DEFINER triggers are the only writers: users still cannot
-- insert notifications directly (there is deliberately no insert policy).
--
-- Events covered:
--   * application_received  (brand)   — a creator applied to a brief
--   * offer_received        (creator) — a brand sent a direct offer
--   * collaboration_accepted / collaboration_declined (the other party)
--   * collaboration_completed (brand) — creator marked the post as published
--   * new_message           (other participants) — coalesced per conversation
--
-- Payloads carry display names so the bell needs no joins.

create index if not exists notifications_profile_created_idx
  on public.notifications (profile_id, created_at desc);
create index if not exists notifications_profile_unread_idx
  on public.notifications (profile_id) where read_at is null;

-- ---------------------------------------------------------------------------
-- Collaboration events
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
        jsonb_build_object(
          'collaboration_id', new.id,
          'campaign_title', new.campaign_title,
          'creator_name', coalesce(v_creator_name, 'A creator')
        )
      );
    elsif new.status = 'needs_action' then
      insert into public.notifications (profile_id, type, payload) values (
        new.creator_profile_id, 'offer_received',
        jsonb_build_object(
          'collaboration_id', new.id,
          'campaign_title', new.campaign_title,
          'brand_name', new.brand_name,
          'price', new.agreed_price
        )
      );
    end if;
    return new;
  end if;

  -- UPDATE: only status transitions matter, and only for the party that did
  -- not perform the action.
  if new.status is not distinct from old.status then
    return new;
  end if;

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

  select display_name into v_creator_name from public.creator_profiles where profile_id = new.creator_profile_id;

  insert into public.notifications (profile_id, type, payload) values (
    v_recipient, v_type,
    jsonb_build_object(
      'collaboration_id', new.id,
      'campaign_title', new.campaign_title,
      'brand_name', new.brand_name,
      'creator_name', coalesce(v_creator_name, 'A creator')
    )
  );
  return new;
end;
$$;

drop trigger if exists collaborations_notify on public.collaborations;
create trigger collaborations_notify
  after insert or update of status on public.collaborations
  for each row execute function public.notify_collaboration_change();

-- ---------------------------------------------------------------------------
-- New messages (coalesced: one unread notification per conversation)
-- ---------------------------------------------------------------------------

create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sender_name text;
  v_recipient uuid;
  v_updated int;
begin
  if new.is_system or new.sender_profile_id is null then
    return new;
  end if;

  -- A creator's pitch note is inserted right after their application; the
  -- application_received notification already covers it.
  if exists (
    select 1
    from public.conversations cv
    join public.collaborations c on c.id = cv.collaboration_id
    where cv.id = new.conversation_id
      and c.status = 'applied'
      and c.creator_profile_id = new.sender_profile_id
      and c.created_at > now() - interval '10 seconds'
  ) then
    return new;
  end if;

  select coalesce(
    (select display_name from public.creator_profiles where profile_id = new.sender_profile_id),
    (select company_name from public.brand_profiles where profile_id = new.sender_profile_id),
    'Someone'
  ) into v_sender_name;

  for v_recipient in
    select profile_id from public.conversation_participants
    where conversation_id = new.conversation_id and profile_id <> new.sender_profile_id
  loop
    update public.notifications
       set payload = jsonb_build_object(
             'conversation_id', new.conversation_id,
             'sender_name', v_sender_name,
             'preview', left(new.body, 120)
           ),
           created_at = now()
     where profile_id = v_recipient
       and type = 'new_message'
       and read_at is null
       and payload->>'conversation_id' = new.conversation_id::text;
    get diagnostics v_updated = row_count;

    if v_updated = 0 then
      insert into public.notifications (profile_id, type, payload) values (
        v_recipient, 'new_message',
        jsonb_build_object(
          'conversation_id', new.conversation_id,
          'sender_name', v_sender_name,
          'preview', left(new.body, 120)
        )
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- Trigger functions are never called directly.
revoke execute on function public.notify_collaboration_change() from public, anon, authenticated;
revoke execute on function public.notify_new_message() from public, anon, authenticated;

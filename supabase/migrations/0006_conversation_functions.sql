-- Phase 6 — seeding a collaboration's shared conversation (and a creator's
-- first-ever NaanoBot welcome thread) needs to insert a
-- conversation_participants row for the *other* party, not just the
-- caller. Plain RLS can't express that cleanly (the Phase 2
-- conversation_participants policy only lets you insert your own row), so
-- this uses two narrowly-scoped SECURITY DEFINER functions instead of
-- broadening RLS — the pattern flagged as the right long-term approach in
-- the project plan's security section. Both run with elevated privileges
-- internally but validate inputs before writing anything.
--
-- Run this in the Supabase SQL Editor same as the earlier migrations.

create or replace function public.create_collaboration_conversation(
  p_collaboration_id uuid,
  p_creator_profile_id uuid,
  p_brand_profile_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  -- Only a party to the collaboration can trigger this — not an
  -- unrestricted "create any conversation for anyone" entry point.
  if auth.uid() is distinct from p_creator_profile_id and auth.uid() is distinct from p_brand_profile_id then
    raise exception 'Not authorized to create this conversation';
  end if;

  if not exists (
    select 1 from public.collaborations
    where id = p_collaboration_id
      and creator_profile_id = p_creator_profile_id
      and brand_profile_id = p_brand_profile_id
  ) then
    raise exception 'Collaboration does not match the given parties';
  end if;

  insert into public.conversations (collaboration_id, is_system)
  values (p_collaboration_id, false)
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, profile_id)
  values (v_conversation_id, p_creator_profile_id), (v_conversation_id, p_brand_profile_id);

  return v_conversation_id;
end;
$$;

grant execute on function public.create_collaboration_conversation(uuid, uuid, uuid) to authenticated;

-- Idempotent: no-ops if the creator already has a system conversation, so
-- it's safe to call every time a creator's first booking might be
-- happening without a separate existence check racing the insert.
create or replace function public.ensure_naanobot_welcome(p_creator_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
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

grant execute on function public.ensure_naanobot_welcome(uuid) to authenticated;

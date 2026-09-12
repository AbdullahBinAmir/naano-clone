-- Lets a creator and a brand start a conversation with each other before
-- any collaboration exists between them (e.g. a brand messaging a creator
-- found on Match, or a creator messaging the brand behind an open
-- campaign). Until now every conversation was created as a side effect of
-- a collaboration (0006_conversation_functions.sql) or was the NaanoBot
-- system thread, so there was no way to message someone new at all.
--
-- A direct conversation is just conversations.collaboration_id = null,
-- is_system = false — the existing is_conversation_participant()-based RLS
-- on conversations/conversation_participants/messages already covers it
-- with no changes, since those policies don't care why a conversation
-- exists, only whether the caller is a participant.
create or replace function public.create_direct_conversation(p_other_profile_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_caller_role public.app_role;
  v_other_role public.app_role;
  v_creator_id uuid;
  v_brand_id uuid;
  v_conversation_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You need to sign in first';
  end if;
  if auth.uid() = p_other_profile_id then
    raise exception 'You cannot message yourself';
  end if;

  select role into v_caller_role from public.profiles where id = auth.uid();
  select role into v_other_role from public.profiles where id = p_other_profile_id;
  if v_caller_role is null or v_other_role is null then
    raise exception 'Profile not found';
  end if;

  if v_caller_role = 'creator' and v_other_role = 'brand' then
    v_creator_id := auth.uid();
    v_brand_id := p_other_profile_id;
  elsif v_caller_role = 'brand' and v_other_role = 'creator' then
    v_creator_id := p_other_profile_id;
    v_brand_id := auth.uid();
  else
    raise exception 'You can only message a brand or creator counterpart';
  end if;

  select conv.id into v_conversation_id
    from public.conversations conv
    where conv.collaboration_id is null
      and conv.is_system = false
      and exists (
        select 1 from public.conversation_participants cp
        where cp.conversation_id = conv.id and cp.profile_id = v_creator_id
      )
      and exists (
        select 1 from public.conversation_participants cp
        where cp.conversation_id = conv.id and cp.profile_id = v_brand_id
      )
    limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into public.conversations (collaboration_id, is_system) values (null, false) returning id into v_conversation_id;
  insert into public.conversation_participants (conversation_id, profile_id)
    values (v_conversation_id, v_creator_id), (v_conversation_id, v_brand_id);

  return v_conversation_id;
end;
$$;
grant execute on function public.create_direct_conversation(uuid) to authenticated;

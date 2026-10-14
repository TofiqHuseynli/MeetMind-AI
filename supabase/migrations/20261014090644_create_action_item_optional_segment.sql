-- A task without a sentence passes no segment, so p_segment_id has to be optional: it moves to
-- the end with a null default (only trailing parameters can have one).

drop function public.create_action_item(uuid, uuid, text, uuid, date, text, text, jsonb, uuid);

-- A new task, at its place in its column. It joins a meeting that has been analysed; made from a
-- suggested task, it takes that suggestion out in the same transaction.
create function public.create_action_item(
  p_meeting_id uuid,
  p_title text,
  p_owner_id uuid,
  p_due_date date,
  p_priority text,
  p_status text default 'todo',
  p_placement jsonb default '"end"',
  p_suggestion_id uuid default null,
  p_segment_id uuid default null
)
returns public.action_items
language plpgsql set search_path = '' as $$
declare
  v_meeting_status text;
  v_item public.action_items;
begin
  select status into v_meeting_status from public.meetings where id = p_meeting_id;
  if v_meeting_status is null then
    raise exception 'The meeting no longer exists.' using errcode = 'P0002';
  elsif v_meeting_status <> 'ready' then
    raise exception 'The meeting is still being analysed.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('action_item_ranks'));
  insert into public.action_items
    (meeting_id, segment_id, title, owner_id, due_date, priority, status, rank)
  values (
    p_meeting_id, p_segment_id, p_title, p_owner_id, p_due_date, p_priority, p_status,
    public.rank_at(p_status, coalesce(p_placement, '"end"'), null)
  )
  returning * into v_item;

  if p_suggestion_id is not null then
    delete from public.suggested_tasks where id = p_suggestion_id;
  end if;
  return v_item;
end;
$$;

revoke execute on function
  public.create_action_item(uuid, text, uuid, date, text, text, jsonb, uuid, uuid)
  from public, anon;
grant execute on function
  public.create_action_item(uuid, text, uuid, date, text, text, jsonb, uuid, uuid)
  to authenticated, service_role;

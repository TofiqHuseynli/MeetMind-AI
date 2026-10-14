-- rank_at may renumber the whole board when a gap runs out. Called inside the UPDATE of the row
-- being moved, that renumbering touches the same row and Postgres refuses the statement ("tuple
-- to be updated was already modified"). So the rank is found first, then written.

create or replace function public.move_action_item(p_id uuid, p_status text, p_placement jsonb)
returns setof public.action_items
language plpgsql set search_path = '' as $$
declare
  v_rank double precision;
begin
  perform pg_advisory_xact_lock(hashtext('action_item_ranks'));
  if not exists (select 1 from public.action_items where id = p_id) then
    raise exception 'This task was deleted.' using errcode = 'P0002';
  end if;
  v_rank := public.rank_at(p_status, p_placement, p_id);
  return query
    update public.action_items
    set status = p_status, rank = v_rank
    where id = p_id
    returning *;
end;
$$;

create or replace function public.create_action_item(
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
  v_rank double precision;
  v_item public.action_items;
begin
  select status into v_meeting_status from public.meetings where id = p_meeting_id;
  if v_meeting_status is null then
    raise exception 'The meeting no longer exists.' using errcode = 'P0002';
  elsif v_meeting_status <> 'ready' then
    raise exception 'The meeting is still being analysed.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('action_item_ranks'));
  v_rank := public.rank_at(p_status, coalesce(p_placement, '"end"'), null);
  insert into public.action_items
    (meeting_id, segment_id, title, owner_id, due_date, priority, status, rank)
  values (p_meeting_id, p_segment_id, p_title, p_owner_id, p_due_date, p_priority, p_status, v_rank)
  returning * into v_item;

  if p_suggestion_id is not null then
    delete from public.suggested_tasks where id = p_suggestion_id;
  end if;
  return v_item;
end;
$$;

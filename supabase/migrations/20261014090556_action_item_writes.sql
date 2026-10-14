-- The action item writes that place a card on the board. A place is a rank inside its status
-- column, lower first, set by these functions as the mock set it: a step past either end,
-- halfway between two neighbours, the whole board renumbered once a gap runs out. Each write
-- holds one lock while it reads and sets ranks, so two cards dropped at once never get the same
-- place.
--
-- A placement comes as JSON: "start", "end", {"before": id} or {"after": id}, the id a card the
-- user sees in that column.

create function public.renumber_action_ranks() returns void
language sql set search_path = '' as $$
  update public.action_items a
  set rank = r.n * 1024
  from (select id, row_number() over (order by rank, id) as n from public.action_items) r
  where a.id = r.id;
$$;

-- The rank that puts an item at the placement in a status's column, without p_except (the item
-- being moved). A neighbour that left the column puts it last.
create function public.rank_at(p_status text, p_placement jsonb, p_except uuid)
returns double precision
language plpgsql set search_path = '' as $$
declare
  step constant double precision := 1024;
  min_gap constant double precision := 1e-6;
  v_first double precision;
  v_last double precision;
  v_before boolean;
  v_neighbour text;
  v_prev double precision;
  v_next double precision;
begin
  select min(rank), max(rank) into v_first, v_last
  from public.action_items
  where status = p_status and id is distinct from p_except;
  if v_first is null then return step; end if;

  if jsonb_typeof(p_placement) = 'string' then
    if p_placement #>> '{}' = 'start' then return v_first - step; end if;
    return v_last + step;
  end if;

  v_before := p_placement ? 'before';
  v_neighbour := coalesce(p_placement ->> 'before', p_placement ->> 'after');
  if v_neighbour is null
    or v_neighbour !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return v_last + step;
  end if;

  select
    case when v_before then c.lag_rank else c.rank end,
    case when v_before then c.rank else c.lead_rank end
  into v_prev, v_next
  from (
    select
      id,
      rank,
      lag(rank) over (order by rank, id) as lag_rank,
      lead(rank) over (order by rank, id) as lead_rank
    from public.action_items
    where status = p_status and id is distinct from p_except
  ) c
  where c.id = v_neighbour::uuid;

  if not found then return v_last + step; end if;
  if v_prev is null then return v_first - step; end if;
  if v_next is null then return v_prev + step; end if;
  if v_next - v_prev > min_gap then return (v_prev + v_next) / 2; end if;
  perform public.renumber_action_ranks();
  return public.rank_at(p_status, p_placement, p_except);
end;
$$;

-- A new status for an item, at a place in that column.
create function public.move_action_item(p_id uuid, p_status text, p_placement jsonb)
returns setof public.action_items
language plpgsql set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('action_item_ranks'));
  return query
    update public.action_items
    set status = p_status, rank = public.rank_at(p_status, p_placement, p_id)
    where id = p_id
    returning *;
  if not found then
    raise exception 'This task was deleted.' using errcode = 'P0002';
  end if;
end;
$$;

-- A new task, at its place in its column. It joins a meeting that has been analysed; made from a
-- suggested task, it takes that suggestion out in the same transaction.
create function public.create_action_item(
  p_meeting_id uuid,
  p_segment_id uuid,
  p_title text,
  p_owner_id uuid,
  p_due_date date,
  p_priority text,
  p_status text default 'todo',
  p_placement jsonb default '"end"',
  p_suggestion_id uuid default null
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

revoke execute on function public.renumber_action_ranks() from public, anon;
revoke execute on function public.rank_at(text, jsonb, uuid) from public, anon;
revoke execute on function public.move_action_item(uuid, text, jsonb) from public, anon;
revoke execute on function
  public.create_action_item(uuid, uuid, text, uuid, date, text, text, jsonb, uuid)
  from public, anon;

-- The functions run as their caller, so the caller needs to run the ones they call too.
grant execute on function public.renumber_action_ranks() to authenticated, service_role;
grant execute on function public.rank_at(text, jsonb, uuid) to authenticated, service_role;
grant execute on function public.move_action_item(uuid, text, jsonb)
  to authenticated, service_role;
grant execute on function
  public.create_action_item(uuid, uuid, text, uuid, date, text, text, jsonb, uuid)
  to authenticated, service_role;

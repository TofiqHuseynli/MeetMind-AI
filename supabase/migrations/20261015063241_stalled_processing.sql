-- A meeting whose work never finished: the start never reached api/process, or Vercel stopped the
-- function before it could mark the meeting failed. api/process lives at most 300 seconds
-- (vercel.json), so a meeting still processing 6 minutes after its start has nobody working on
-- it. The view shows it as failed, with a reason, and Retry starts it again like any failure.

alter table public.meetings add column processing_started_at timestamptz;
update public.meetings set processing_started_at = created_at;
alter table public.meetings
  alter column processing_started_at set default now(),
  alter column processing_started_at set not null;

create function public.processing_stalled(p_status text, p_started_at timestamptz)
returns boolean
language sql stable set search_path = '' as $$
  select p_status = 'processing' and p_started_at < now() - interval '6 minutes';
$$;

revoke execute on function public.processing_stalled(text, timestamptz) from public, anon;
grant execute on function public.processing_stalled(text, timestamptz)
  to authenticated, service_role;

-- The view restated with status and failure_reason read through the check above; the columns
-- and their order stay the same.
create or replace view public.meeting_rows with (security_invoker = true) as
select
  m.id,
  m.title,
  m.project_id,
  p.team_id,
  m.date,
  m.duration_min,
  case when public.processing_stalled(m.status, m.processing_started_at)
    then 'failed' else m.status end as status,
  case when public.processing_stalled(m.status, m.processing_started_at)
    then 'Processing stopped before it finished. Try again.'
    else m.failure_reason end as failure_reason,
  m.source_kind,
  m.source_file_name,
  m.source_path,
  m.summary,
  m.sentiment_score,
  m.sentiment_label,
  m.created_at,
  coalesce(people.participant_ids, '{}') as participant_ids,
  coalesce(people.participation, '[]') as participation,
  case when m.status = 'ready' then coalesce(counts.todo, 0) end as todo_count,
  case when m.status = 'ready' then coalesce(counts.in_progress, 0) end as in_progress_count,
  case when m.status = 'ready' then coalesce(counts.done, 0) end as done_count,
  case when m.status = 'ready' then coalesce(counts.overdue, 0) end as overdue_count,
  -- What the "tasks" sort orders by: the items not done yet.
  case when m.status = 'ready'
    then coalesce(counts.todo + counts.in_progress + counts.overdue, 0) end as open_count,
  exists (select 1 from public.transcript_segments s where s.meeting_id = m.id)
    as has_transcript,
  m.title || ' ' || array_to_string(m.summary, ' ') as search_text
from public.meetings m
join public.projects p on p.id = m.project_id
left join lateral (
  select
    array_agg(mp.person_id order by mp.talk_share_pct desc, mp.person_id) as participant_ids,
    jsonb_agg(
      jsonb_build_object(
        'personId', mp.person_id,
        'talkSharePct', mp.talk_share_pct,
        'segmentCount', mp.segment_count
      )
      order by mp.talk_share_pct desc, mp.person_id
    ) filter (where m.status = 'ready') as participation
  from public.meeting_participants mp
  where mp.meeting_id = m.id
) people on true
left join lateral (
  select
    count(*) filter (where a.status = 'done') as done,
    count(*) filter (where a.status <> 'done' and a.due_date < current_date) as overdue,
    count(*) filter (where a.status = 'in_progress' and a.due_date >= current_date)
      as in_progress,
    count(*) filter (where a.status = 'todo' and a.due_date >= current_date) as todo
  from public.action_items a
  where a.meeting_id = m.id
) counts on true;

-- Sets the failed and the stalled meetings among p_ids processing again, from now, and returns
-- their ids for api/process to start. A meeting still being worked on is left alone.
create function public.retry_processing(p_ids uuid[])
returns setof uuid
language sql set search_path = '' as $$
  update public.meetings
  set status = 'processing', failure_reason = null, processing_started_at = now()
  where id = any(p_ids)
    and (status = 'failed' or public.processing_stalled(status, processing_started_at))
  returning id;
$$;

revoke execute on function public.retry_processing(uuid[]) from public, anon;
grant execute on function public.retry_processing(uuid[]) to authenticated, service_role;

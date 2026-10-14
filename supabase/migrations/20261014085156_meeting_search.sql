-- The meeting search looks in the title and the summary, as the mock did. The view gets one
-- column with both. A view can only grow at its end, so the whole view is restated with
-- search_text last. No index: array_to_string is not immutable, and a team has few meetings.

create or replace view public.meeting_rows with (security_invoker = true) as
select
  m.id,
  m.title,
  m.project_id,
  p.team_id,
  m.date,
  m.duration_min,
  m.status,
  m.failure_reason,
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

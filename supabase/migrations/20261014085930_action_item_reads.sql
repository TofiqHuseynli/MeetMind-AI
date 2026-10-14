-- The action item reads and the dashboard numbers.

-- The list searches the owner's name as well as the title, and sorts priority and status by
-- their meaning (low < medium < high, to do < in progress < done), not by their spelling. A view
-- can only grow at its end, so the new columns come last.
create or replace view public.action_item_rows with (security_invoker = true) as
select
  a.*,
  m.title as meeting_title,
  m.project_id as meeting_project_id,
  p.team_id as meeting_team_id,
  o.name as owner_name,
  case a.priority when 'low' then 0 when 'medium' then 1 else 2 end as priority_rank,
  case a.status when 'todo' then 0 when 'in_progress' then 1 else 2 end as status_rank
from public.action_items a
join public.meetings m on m.id = a.meeting_id
join public.projects p on p.id = m.project_id
join public.people o on o.id = a.owner_id;

-- What the dashboard shows, counted as the mock counted it. A week is the seven days ending
-- p_today, the reader's today; moments are read as days in the reader's time zone, so "this
-- week" and "overdue" mean what they mean where the reader is.
create function public.dashboard_statistics(p_today date, p_time_zone text)
returns jsonb
language sql stable set search_path = '' as $$
  with meeting_days as (
    select
      m.status,
      m.duration_min,
      m.sentiment_score,
      p_today - (m.date at time zone p_time_zone)::date as days_ago
    from public.meetings m
  ),
  created_days as (
    select p_today - (a.created_at at time zone p_time_zone)::date as days_ago
    from public.action_items a
  ),
  weeks as (
    select
      w as week,
      count(*) filter (where floor(d.days_ago / 7.0) = w) as meetings,
      coalesce(sum(d.duration_min) filter (where floor(d.days_ago / 7.0) = w), 0) as minutes,
      avg(d.sentiment_score) filter (where floor(d.days_ago / 7.0) = w) as sentiment,
      avg(d.sentiment_score)
        filter (where floor(d.days_ago / 7.0) = w and d.status = 'ready') as ready_sentiment,
      count(*) filter (where floor(d.days_ago / 7.0) = w and d.status = 'ready') as ready
    from generate_series(0, 3) as w
    left join meeting_days d on true
    group by w
  ),
  created as (
    select w as week, count(*) filter (where floor(c.days_ago / 7.0) = w) as items
    from generate_series(0, 1) as w
    left join created_days c on true
    group by w
  ),
  days as (
    select
      ago,
      (select count(*) from meeting_days d where d.days_ago = ago) as meetings
    from generate_series(27, 0, -1) as ago
  ),
  open_items as (
    select
      count(*) filter (where priority = 'low') as low,
      count(*) filter (where priority = 'medium') as medium,
      count(*) filter (where priority = 'high') as high,
      count(*) filter (where due_date < p_today) as overdue
    from public.action_items
    where status <> 'done'
  )
  select jsonb_build_object(
    'thisWeek', (
      select jsonb_build_object(
        'meetings', w.meetings, 'minutes', w.minutes, 'sentiment', w.sentiment,
        'actionItemsCreated', (select c.items from created c where c.week = 0))
      from weeks w where w.week = 0),
    'lastWeek', (
      select jsonb_build_object(
        'meetings', w.meetings, 'minutes', w.minutes, 'sentiment', w.sentiment,
        'actionItemsCreated', (select c.items from created c where c.week = 1))
      from weeks w where w.week = 1),
    'days', (
      select jsonb_agg(
        jsonb_build_object('date', to_char(p_today - d.ago, 'YYYY-MM-DD'), 'meetings', d.meetings)
        order by d.ago desc)
      from days d),
    'sentimentByWeek', (
      select jsonb_agg(
        jsonb_build_object(
          'weekStart', to_char(p_today - (w.week * 7 + 6), 'YYYY-MM-DD'),
          'score', w.ready_sentiment,
          'meetings', w.ready)
        order by w.week desc)
      from weeks w),
    'openByPriority', (
      select jsonb_build_object('low', o.low, 'medium', o.medium, 'high', o.high)
      from open_items o),
    'overdue', (select o.overdue from open_items o)
  );
$$;

revoke execute on function public.dashboard_statistics(date, text) from public, anon;
grant execute on function public.dashboard_statistics(date, text) to authenticated, service_role;

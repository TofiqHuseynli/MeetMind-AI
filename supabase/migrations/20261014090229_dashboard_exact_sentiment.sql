-- sentiment_score is a real (float4); averaged as it is, 0.4 comes out as 0.40000000596. The
-- dashboard averages it as numeric, so the means are the numbers that were stored.

create or replace function public.dashboard_statistics(p_today date, p_time_zone text)
returns jsonb
language sql stable set search_path = '' as $$
  with meeting_days as (
    select
      m.status,
      m.duration_min,
      m.sentiment_score::numeric as sentiment_score,
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

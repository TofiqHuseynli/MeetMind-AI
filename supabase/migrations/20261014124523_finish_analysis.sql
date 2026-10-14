-- The end of the pipeline: everything an analysis found, written in one transaction, and the
-- meeting ready. Called by api/ with the service role once the model's answer has been checked.
--
-- p_analysis is JSON:
--   segments          [{position, speaker_label, start_sec, end_sec, text, sentiment}]: the lines
--                     of a text transcript; null when the lines are already in (speech to text)
--   speakers          [{label, person_id}]: who each label is; person_id null when unknown
--   segment_sentiments [{position, sentiment}]: the mood of lines already in
--   summary           [text], sentiment {score, label}
--   chapters          [{title, first, last}]               positions of the first and last line
--   decisions         [{text, position}]                   position null: no sentence
--   risks             [{text, severity, position}]
--   insights          [{text, position}]
--   suggested_tasks   [{title, owner_id, due_date, priority, position}]
--   action_items      [{title, owner_id, due_date, priority, position}]
-- Every position points at a line of this meeting; api/ checks that before it calls.

create function public.finish_analysis(p_meeting_id uuid, p_analysis jsonb)
returns void
language plpgsql set search_path = '' as $$
declare
  v_status text;
  v_item jsonb;
  v_total real;
  v_last_end real;
begin
  select status into v_status from public.meetings where id = p_meeting_id for update;
  if v_status is null then
    raise exception 'The meeting no longer exists.' using errcode = 'P0002';
  elsif v_status <> 'processing' then
    raise exception 'The meeting is not being processed.' using errcode = 'P0001';
  end if;

  -- A text transcript brings its lines: any from an earlier try go first, with what they had.
  if jsonb_typeof(p_analysis -> 'segments') = 'array' then
    delete from public.transcript_segments where meeting_id = p_meeting_id;
    delete from public.meeting_speakers where meeting_id = p_meeting_id;
  end if;
  delete from public.decisions where meeting_id = p_meeting_id;
  delete from public.action_items where meeting_id = p_meeting_id;

  insert into public.meeting_speakers (meeting_id, label, person_id)
  select p_meeting_id, s ->> 'label', nullif(s ->> 'person_id', '')::uuid
  from jsonb_array_elements(coalesce(p_analysis -> 'speakers', '[]')) s
  on conflict (meeting_id, label) do update set person_id = excluded.person_id;

  if jsonb_typeof(p_analysis -> 'segments') = 'array' then
    insert into public.transcript_segments
      (meeting_id, position, speaker_label, start_sec, end_sec, text, sentiment)
    select
      p_meeting_id,
      (s ->> 'position')::integer,
      s ->> 'speaker_label',
      (s ->> 'start_sec')::real,
      (s ->> 'end_sec')::real,
      s ->> 'text',
      coalesce(s ->> 'sentiment', 'neutral')
    from jsonb_array_elements(p_analysis -> 'segments') s;
  else
    update public.transcript_segments t
    set sentiment = s ->> 'sentiment'
    from jsonb_array_elements(coalesce(p_analysis -> 'segment_sentiments', '[]')) s
    where t.meeting_id = p_meeting_id and t.position = (s ->> 'position')::integer;
  end if;

  insert into public.chapters
    (meeting_id, title, first_segment_id, last_segment_id, start_sec, end_sec)
  select p_meeting_id, c ->> 'title', f.id, l.id, f.start_sec, greatest(l.end_sec, f.start_sec)
  from jsonb_array_elements(coalesce(p_analysis -> 'chapters', '[]')) c
  join public.transcript_segments f
    on f.meeting_id = p_meeting_id and f.position = (c ->> 'first')::integer
  join public.transcript_segments l
    on l.meeting_id = p_meeting_id and l.position = (c ->> 'last')::integer;

  insert into public.decisions (meeting_id, segment_id, text)
  select p_meeting_id, t.id, d ->> 'text'
  from jsonb_array_elements(coalesce(p_analysis -> 'decisions', '[]')) d
  left join public.transcript_segments t
    on t.meeting_id = p_meeting_id and t.position = (d ->> 'position')::integer;

  insert into public.risks (meeting_id, segment_id, text, severity)
  select p_meeting_id, t.id, r ->> 'text', r ->> 'severity'
  from jsonb_array_elements(coalesce(p_analysis -> 'risks', '[]')) r
  join public.transcript_segments t
    on t.meeting_id = p_meeting_id and t.position = (r ->> 'position')::integer;

  insert into public.insights (meeting_id, segment_id, text)
  select p_meeting_id, t.id, i ->> 'text'
  from jsonb_array_elements(coalesce(p_analysis -> 'insights', '[]')) i
  join public.transcript_segments t
    on t.meeting_id = p_meeting_id and t.position = (i ->> 'position')::integer;

  insert into public.suggested_tasks
    (meeting_id, segment_id, title, owner_id, due_date, priority)
  select
    p_meeting_id, t.id, s ->> 'title', (s ->> 'owner_id')::uuid, (s ->> 'due_date')::date,
    s ->> 'priority'
  from jsonb_array_elements(coalesce(p_analysis -> 'suggested_tasks', '[]')) s
  join public.transcript_segments t
    on t.meeting_id = p_meeting_id and t.position = (s ->> 'position')::integer;

  -- Tasks go last in To do, one after another, as a create would place them.
  perform pg_advisory_xact_lock(hashtext('action_item_ranks'));
  for v_item in select * from jsonb_array_elements(coalesce(p_analysis -> 'action_items', '[]'))
  loop
    insert into public.action_items
      (meeting_id, segment_id, title, owner_id, due_date, priority, status, rank)
    select
      p_meeting_id, t.id, v_item ->> 'title', (v_item ->> 'owner_id')::uuid,
      (v_item ->> 'due_date')::date, v_item ->> 'priority', 'todo',
      public.rank_at('todo', '"end"', null)
    from (select 1) one
    left join public.transcript_segments t
      on t.meeting_id = p_meeting_id and t.position = (v_item ->> 'position')::integer;
  end loop;

  -- Who spoke how much: each person's share of the spoken time, and their number of lines.
  select coalesce(sum(end_sec - start_sec), 0), coalesce(max(end_sec), 0)
  into v_total, v_last_end
  from public.transcript_segments where meeting_id = p_meeting_id;

  insert into public.meeting_participants (meeting_id, person_id, talk_share_pct, segment_count)
  select
    p_meeting_id,
    sp.person_id,
    case when v_total > 0 then round(100 * sum(t.end_sec - t.start_sec) / v_total) else 0 end,
    count(*)
  from public.transcript_segments t
  join public.meeting_speakers sp
    on sp.meeting_id = t.meeting_id and sp.label = t.speaker_label and sp.person_id is not null
  where t.meeting_id = p_meeting_id
  group by sp.person_id
  on conflict (meeting_id, person_id) do update
    set talk_share_pct = excluded.talk_share_pct, segment_count = excluded.segment_count;

  update public.meetings
  set
    status = 'ready',
    failure_reason = null,
    summary = coalesce(
      array(select jsonb_array_elements_text(coalesce(p_analysis -> 'summary', '[]'))), '{}'),
    sentiment_score = (p_analysis -> 'sentiment' ->> 'score')::real,
    sentiment_label = p_analysis -> 'sentiment' ->> 'label',
    duration_min = case when duration_min > 0 then duration_min
                        else ceil(v_last_end / 60.0)::integer end
  where id = p_meeting_id;
end;
$$;

-- Only the functions in api/ write an analysis; nobody signed in calls this from a browser.
revoke execute on function public.finish_analysis(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.finish_analysis(uuid, jsonb) to service_role;

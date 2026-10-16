-- An upload needs only its file. Without a title the analysis names the meeting; without a
-- project it goes to the Inbox; without participants the analysis finds the speakers by the
-- names said in the meeting, and makes a person for a name nobody on the team has yet.

-- The Inbox: where a meeting uploaded without a project waits to be moved.
insert into public.teams (id, name)
values ('00000000-0000-4000-8000-000000000001', 'Inbox')
on conflict do nothing;
insert into public.projects (id, team_id, name)
values ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Inbox')
on conflict do nothing;

-- True while the title is a stand-in from the file name, for the analysis to replace.
alter table public.meetings add column title_auto boolean not null default false;

-- Everything but the file is optional now, so those parameters move to the end with defaults.
drop function public.create_upload(text, uuid, text, text, text, uuid[]);

create function public.create_upload(
  p_source_kind text,
  p_source_file_name text,
  p_source_path text,
  p_title text default null,
  p_project_id uuid default null,
  p_participant_ids uuid[] default '{}'
)
returns public.meetings
language plpgsql set search_path = '' as $$
declare
  v_meeting public.meetings;
  v_title text := nullif(trim(p_title), '');
begin
  insert into public.meetings
    (title, title_auto, project_id, status, source_kind, source_file_name, source_path)
  values (
    coalesce(
      v_title,
      nullif(left(trim(regexp_replace(
        regexp_replace(p_source_file_name, '\.[^.]*$', ''), '[-_.]+', ' ', 'g')), 160), ''),
      'Untitled meeting'
    ),
    v_title is null,
    coalesce(p_project_id, '00000000-0000-4000-8000-000000000002'),
    'processing',
    p_source_kind,
    p_source_file_name,
    p_source_path
  )
  returning * into v_meeting;

  insert into public.meeting_participants (meeting_id, person_id)
  select v_meeting.id, person_id
  from unnest(coalesce(p_participant_ids, '{}')) as person_id
  on conflict do nothing;

  return v_meeting;
end;
$$;

revoke execute on function public.create_upload(text, text, text, text, uuid, uuid[])
  from public, anon;
grant execute on function public.create_upload(text, text, text, text, uuid, uuid[])
  to authenticated, service_role;

-- "Who is Person 1?" may now name anyone on the team: the person joins the meeting.
create or replace function public.name_speaker(p_meeting_id uuid, p_label text, p_person_id uuid)
returns void
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.people where id = p_person_id) then
    raise exception 'That person no longer exists.' using errcode = 'P0002';
  end if;
  update public.meeting_speakers
  set person_id = p_person_id
  where meeting_id = p_meeting_id and label = p_label;
  if not found then
    raise exception 'That speaker is not in the transcript.' using errcode = 'P0002';
  end if;
  insert into public.meeting_participants (meeting_id, person_id)
  values (p_meeting_id, p_person_id)
  on conflict do nothing;
  perform public.recount_participation(p_meeting_id);
end;
$$;

-- The end of the pipeline, restated with three changes:
--   title             the analysis's title, used while title_auto is true
--   speakers          [{label, person_id, name}]: name is what the voice is called in the
--                     meeting, given when person_id is null; a person is found by that name or
--                     made with it
--   tasks             owner_id, or owner_label (a speaker label) when the owner is only known by
--                     voice; neither, or a voice nobody is named for, gives the task to who
--                     uploaded the meeting, else to a participant. A task's owner joins the
--                     meeting.
-- Everything else is as in 20261014124523_finish_analysis.sql.
create or replace function public.finish_analysis(p_meeting_id uuid, p_analysis jsonb)
returns void
language plpgsql set search_path = '' as $$
declare
  v_status text;
  v_item jsonb;
  v_person uuid;
  v_name text;
  v_fallback uuid;
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

  for v_item in select * from jsonb_array_elements(coalesce(p_analysis -> 'speakers', '[]'))
  loop
    v_person := nullif(v_item ->> 'person_id', '')::uuid;
    v_name := left(nullif(trim(v_item ->> 'name'), ''), 120);
    if v_person is null and v_name is not null then
      select id into v_person from public.people
      where lower(trim(name)) = lower(v_name)
      order by created_at
      limit 1;
      if v_person is null then
        insert into public.people (name) values (v_name) returning id into v_person;
      end if;
    end if;
    insert into public.meeting_speakers (meeting_id, label, person_id)
    values (p_meeting_id, v_item ->> 'label', v_person)
    on conflict (meeting_id, label) do update set person_id = excluded.person_id;
  end loop;

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

  -- Who a task goes to when the analysis names nobody it can place.
  select p.id into v_fallback
  from public.meetings m
  join public.people p on p.user_id = m.created_by
  where m.id = p_meeting_id;
  if v_fallback is null then
    select person_id into v_fallback from public.meeting_participants
    where meeting_id = p_meeting_id
    order by person_id
    limit 1;
  end if;
  if v_fallback is null then
    select person_id into v_fallback from public.meeting_speakers
    where meeting_id = p_meeting_id and person_id is not null
    order by label
    limit 1;
  end if;
  if v_fallback is null and (
    jsonb_array_length(coalesce(p_analysis -> 'action_items', '[]')) > 0
    or jsonb_array_length(coalesce(p_analysis -> 'suggested_tasks', '[]')) > 0
  ) then
    raise exception 'Nobody to give the tasks to: pick who took part and try again.'
      using errcode = 'P0001';
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
    p_meeting_id, t.id, s ->> 'title',
    coalesce(nullif(s ->> 'owner_id', '')::uuid, sp.person_id, v_fallback),
    (s ->> 'due_date')::date, s ->> 'priority'
  from jsonb_array_elements(coalesce(p_analysis -> 'suggested_tasks', '[]')) s
  join public.transcript_segments t
    on t.meeting_id = p_meeting_id and t.position = (s ->> 'position')::integer
  left join public.meeting_speakers sp
    on sp.meeting_id = p_meeting_id and sp.label = s ->> 'owner_label';

  -- Tasks go last in To do, one after another, as a create would place them.
  perform pg_advisory_xact_lock(hashtext('action_item_ranks'));
  for v_item in select * from jsonb_array_elements(coalesce(p_analysis -> 'action_items', '[]'))
  loop
    insert into public.action_items
      (meeting_id, segment_id, title, owner_id, due_date, priority, status, rank)
    select
      p_meeting_id, t.id, v_item ->> 'title',
      coalesce(nullif(v_item ->> 'owner_id', '')::uuid, sp.person_id, v_fallback),
      (v_item ->> 'due_date')::date, v_item ->> 'priority', 'todo',
      public.rank_at('todo', '"end"', null)
    from (select 1) one
    left join public.transcript_segments t
      on t.meeting_id = p_meeting_id and t.position = (v_item ->> 'position')::integer
    left join public.meeting_speakers sp
      on sp.meeting_id = p_meeting_id and sp.label = v_item ->> 'owner_label';
  end loop;

  -- Whoever owns a task took part, so the meeting's own pickers offer them.
  insert into public.meeting_participants (meeting_id, person_id)
  select p_meeting_id, owner_id from public.action_items where meeting_id = p_meeting_id
  union
  select p_meeting_id, owner_id from public.suggested_tasks where meeting_id = p_meeting_id
  on conflict do nothing;

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
    title = case
      when title_auto and length(trim(coalesce(p_analysis ->> 'title', ''))) between 1 and 160
        then trim(p_analysis ->> 'title')
      else title end,
    title_auto = false,
    summary = coalesce(
      array(select jsonb_array_elements_text(coalesce(p_analysis -> 'summary', '[]'))), '{}'),
    sentiment_score = (p_analysis -> 'sentiment' ->> 'score')::real,
    sentiment_label = p_analysis -> 'sentiment' ->> 'label',
    duration_min = case when duration_min > 0 then duration_min
                        else ceil(v_last_end / 60.0)::integer end
  where id = p_meeting_id;
end;
$$;

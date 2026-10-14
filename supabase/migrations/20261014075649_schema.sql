-- The data of the Meeting Intelligence Dashboard. Tables follow src/types/; the views carry
-- what the lists show, counted by the database as the mock counted it in JavaScript.
-- Access: the authenticated role only. Nothing is granted to anon.

create extension if not exists pg_trgm with schema extensions;

-- Reference data -------------------------------------------------------------------------------

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (team_id, name)
);

-- People are records, not users. A signed-in user is linked to their person by user_id.
create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  role text not null default '' check (length(role) <= 80),
  email text unique check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  avatar_tone text not null
    check (avatar_tone in ('speaker-1', 'speaker-2', 'speaker-3', 'speaker-4', 'speaker-5',
                           'speaker-6')),
  user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- The service picks a new person's hue: the six speaker hues in turn.
create function public.pick_avatar_tone() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.avatar_tone is null then
    new.avatar_tone := 'speaker-' || ((select count(*) from public.people) % 6 + 1);
  end if;
  return new;
end;
$$;

create trigger people_pick_avatar_tone
  before insert on public.people
  for each row execute function public.pick_avatar_tone();

-- Meetings ------------------------------------------------------------------------------------

-- The team comes with the project, so a meeting moved to another project can never keep a team
-- that no longer fits.
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  project_id uuid not null references public.projects (id) on delete restrict,
  date timestamptz not null default now(),
  duration_min integer not null default 0 check (duration_min >= 0),
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  -- Why the analysis failed, for the failed state; null otherwise.
  failure_reason text,
  source_kind text not null check (source_kind in ('audio', 'transcript')),
  source_file_name text not null check (length(source_file_name) between 1 and 255),
  -- Where the file is in Storage; null for a meeting made without one.
  source_path text,
  summary text[] not null default '{}',
  -- Null until the meeting is ready. The score runs from -1 to 1.
  sentiment_score real check (sentiment_score between -1 and 1),
  sentiment_label text check (sentiment_label in ('positive', 'neutral', 'negative')),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null
);

-- Who took part and how much they spoke. The shares are 0 until the meeting is ready.
create table public.meeting_participants (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete restrict,
  talk_share_pct integer not null default 0 check (talk_share_pct between 0 and 100),
  segment_count integer not null default 0 check (segment_count >= 0),
  primary key (meeting_id, person_id)
);

-- The speaker labels of a transcript ("Speaker A", a name in a text file) and the person each
-- one is; person_id stays null until someone says who it is.
create table public.meeting_speakers (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  label text not null check (length(label) between 1 and 120),
  person_id uuid references public.people (id) on delete set null,
  primary key (meeting_id, label)
);

-- Transcript ----------------------------------------------------------------------------------

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  -- Spoken order, from 0.
  position integer not null check (position >= 0),
  speaker_label text not null,
  start_sec real not null check (start_sec >= 0),
  end_sec real not null check (end_sec >= start_sec),
  text text not null,
  sentiment text not null default 'neutral'
    check (sentiment in ('positive', 'neutral', 'negative')),
  unique (meeting_id, position),
  -- Lets the tables below point at a sentence of their own meeting only.
  unique (id, meeting_id),
  foreign key (meeting_id, speaker_label)
    references public.meeting_speakers (meeting_id, label) on delete cascade
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  first_segment_id uuid not null,
  last_segment_id uuid not null,
  start_sec real not null,
  end_sec real not null check (end_sec >= start_sec),
  foreign key (first_segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade,
  foreign key (last_segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade
);

-- What the analysis found, each tied to its sentence ------------------------------------------

-- A decision added by hand has no sentence; the list shows those last, in the order they came.
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  segment_id uuid,
  text text not null check (length(trim(text)) between 1 and 500),
  created_at timestamptz not null default now(),
  foreign key (segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  segment_id uuid not null,
  text text not null check (length(trim(text)) between 1 and 500),
  severity text not null check (severity in ('low', 'medium', 'high')),
  foreign key (segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  segment_id uuid not null,
  text text not null check (length(trim(text)) between 1 and 500),
  foreign key (segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade
);

-- A task the analysis proposes for a sentence nobody took the work on from. Making it a task or
-- dismissing it deletes the row.
create table public.suggested_tasks (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  segment_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 160),
  owner_id uuid not null references public.people (id) on delete cascade,
  due_date date not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  foreign key (segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade
);

-- Action items --------------------------------------------------------------------------------

-- A due date is a day, not a moment, so it is a date: no time zone can move it.
create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  segment_id uuid,
  title text not null check (length(trim(title)) between 1 and 160),
  owner_id uuid not null references public.people (id) on delete restrict,
  due_date date not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  -- The place on the board inside its status column, lower first. The service sets it.
  rank double precision not null,
  created_at timestamptz not null default now(),
  foreign key (segment_id, meeting_id)
    references public.transcript_segments (id, meeting_id) on delete cascade
);

-- Indexes -------------------------------------------------------------------------------------

create index projects_team_id on public.projects (team_id);
create index meetings_project_id on public.meetings (project_id);
create index meetings_date on public.meetings (date desc, id);
create index meetings_status on public.meetings (status);
create index meetings_title_trgm on public.meetings using gin (title extensions.gin_trgm_ops);
create index meeting_participants_person_id on public.meeting_participants (person_id);
create index meeting_speakers_person_id on public.meeting_speakers (person_id);
create index transcript_segments_text_trgm
  on public.transcript_segments using gin (text extensions.gin_trgm_ops);
create index chapters_meeting_id on public.chapters (meeting_id, start_sec);
create index decisions_meeting_id on public.decisions (meeting_id);
create index decisions_segment_id on public.decisions (segment_id);
create index risks_meeting_segment on public.risks (meeting_id, segment_id);
create index insights_meeting_segment on public.insights (meeting_id, segment_id);
create index suggested_tasks_meeting_segment on public.suggested_tasks (meeting_id, segment_id);
create index suggested_tasks_owner_id on public.suggested_tasks (owner_id);
create index action_items_meeting_id on public.action_items (meeting_id);
create index action_items_segment_id on public.action_items (segment_id);
create index action_items_owner_id on public.action_items (owner_id);
create index action_items_board on public.action_items (status, rank, id);
create index action_items_due_date on public.action_items (due_date);
create index action_items_created_at on public.action_items (created_at desc, id);
create index action_items_title_trgm
  on public.action_items using gin (title extensions.gin_trgm_ops);
create index people_name_trgm on public.people using gin (name extensions.gin_trgm_ops);

-- Views: what a list row shows ----------------------------------------------------------------

-- A meeting as the list and the meeting page get it: its team, its people and how much each
-- spoke, and its action items counted once each (done, overdue, in progress, to do). The
-- counts are null until the meeting is ready, as in MeetingListItem.
create view public.meeting_rows with (security_invoker = true) as
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
    as has_transcript
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

-- An action item with its meeting, as the list across meetings gets it.
create view public.action_item_rows with (security_invoker = true) as
select
  a.*,
  m.title as meeting_title,
  m.project_id as meeting_project_id,
  p.team_id as meeting_team_id
from public.action_items a
join public.meetings m on m.id = a.meeting_id
join public.projects p on p.id = m.project_id;

-- Access --------------------------------------------------------------------------------------

alter table public.teams enable row level security;
alter table public.projects enable row level security;
alter table public.people enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_participants enable row level security;
alter table public.meeting_speakers enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.chapters enable row level security;
alter table public.decisions enable row level security;
alter table public.risks enable row level security;
alter table public.insights enable row level security;
alter table public.suggested_tasks enable row level security;
alter table public.action_items enable row level security;

-- The app belongs to one team: every signed-in member reads and writes everything. Nobody
-- signed out gets anything.
do $$
declare
  t text;
begin
  foreach t in array array[
    'teams', 'projects', 'people', 'meetings', 'meeting_participants', 'meeting_speakers',
    'transcript_segments', 'chapters', 'decisions', 'risks', 'insights', 'suggested_tasks',
    'action_items'
  ] loop
    execute format(
      'create policy "Members read and write" on public.%I for all to authenticated '
      'using (true) with check (true)', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    -- The functions in api/ write with the service role, which skips the policies but still
    -- needs the grants.
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end;
$$;

revoke all on public.meeting_rows, public.action_item_rows from anon;
grant select on public.meeting_rows, public.action_item_rows to authenticated, service_role;
revoke execute on function public.pick_avatar_tone() from public, anon;

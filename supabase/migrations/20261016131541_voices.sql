-- The meeting's voices on the Participants tab: who each is, how many lines it has and a couple
-- of its lines, so a member can tell who it is and name or rename it.

create view public.speaker_rows with (security_invoker = true) as
select
  sp.meeting_id,
  sp.label,
  sp.person_id,
  (select count(*) from public.transcript_segments t
    where t.meeting_id = sp.meeting_id and t.speaker_label = sp.label) as line_count,
  -- Two early lines long enough to say something, shown in spoken order.
  coalesce((
    select jsonb_agg(
      jsonb_build_object('segmentId', s.id, 'startSec', s.start_sec, 'text', s.text)
      order by s.position
    )
    from (
      select t.id, t.start_sec, t.text, t.position
      from public.transcript_segments t
      where t.meeting_id = sp.meeting_id and t.speaker_label = sp.label
      order by length(t.text) >= 30 desc, t.position
      limit 2
    ) s
  ), '[]') as samples
from public.meeting_speakers sp;

grant select on public.speaker_rows to authenticated, service_role;

-- Naming a voice now also renames: the tasks that came from its lines move from whom it was to
-- whom it is, and whom it was leaves the meeting once no voice and no task is theirs.
create or replace function public.name_speaker(p_meeting_id uuid, p_label text, p_person_id uuid)
returns void
language plpgsql set search_path = '' as $$
declare
  v_previous uuid;
begin
  if not exists (select 1 from public.people where id = p_person_id) then
    raise exception 'That person no longer exists.' using errcode = 'P0002';
  end if;
  select person_id into v_previous from public.meeting_speakers
  where meeting_id = p_meeting_id and label = p_label
  for update;
  if not found then
    raise exception 'That speaker is not in the transcript.' using errcode = 'P0002';
  end if;

  update public.meeting_speakers
  set person_id = p_person_id
  where meeting_id = p_meeting_id and label = p_label;
  insert into public.meeting_participants (meeting_id, person_id)
  values (p_meeting_id, p_person_id)
  on conflict do nothing;

  if v_previous is not null and v_previous <> p_person_id then
    update public.action_items a
    set owner_id = p_person_id
    from public.transcript_segments t
    where a.meeting_id = p_meeting_id and a.owner_id = v_previous
      and t.id = a.segment_id and t.speaker_label = p_label;
    update public.suggested_tasks s
    set owner_id = p_person_id
    from public.transcript_segments t
    where s.meeting_id = p_meeting_id and s.owner_id = v_previous
      and t.id = s.segment_id and t.speaker_label = p_label;

    delete from public.meeting_participants mp
    where mp.meeting_id = p_meeting_id and mp.person_id = v_previous
      and not exists (select 1 from public.meeting_speakers
                      where meeting_id = p_meeting_id and person_id = v_previous)
      and not exists (select 1 from public.action_items
                      where meeting_id = p_meeting_id and owner_id = v_previous)
      and not exists (select 1 from public.suggested_tasks
                      where meeting_id = p_meeting_id and owner_id = v_previous);
  end if;

  perform public.recount_participation(p_meeting_id);
end;
$$;

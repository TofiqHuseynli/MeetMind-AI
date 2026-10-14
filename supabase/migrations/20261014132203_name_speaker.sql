-- "Who is Speaker 1?": a member names a voice the analysis could not place. The label then
-- stands for that person on every line, and the talk shares are counted again.

create function public.recount_participation(p_meeting_id uuid) returns void
language sql set search_path = '' as $$
  with spoken as (
    select coalesce(sum(end_sec - start_sec), 0) as total
    from public.transcript_segments where meeting_id = p_meeting_id
  ),
  shares as (
    select
      sp.person_id,
      case when spoken.total > 0
        then round(100 * sum(t.end_sec - t.start_sec) / spoken.total) else 0 end as pct,
      count(*) as lines
    from public.transcript_segments t
    join public.meeting_speakers sp
      on sp.meeting_id = t.meeting_id and sp.label = t.speaker_label and sp.person_id is not null
    cross join spoken
    where t.meeting_id = p_meeting_id
    group by sp.person_id, spoken.total
  )
  update public.meeting_participants mp
  set talk_share_pct = coalesce(s.pct, 0), segment_count = coalesce(s.lines, 0)
  from public.meeting_participants m
  left join shares s on s.person_id = m.person_id
  where mp.meeting_id = p_meeting_id
    and m.meeting_id = mp.meeting_id and m.person_id = mp.person_id;
$$;

create function public.name_speaker(p_meeting_id uuid, p_label text, p_person_id uuid)
returns void
language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.meeting_participants
    where meeting_id = p_meeting_id and person_id = p_person_id
  ) then
    raise exception 'Pick someone who took part in the meeting.' using errcode = 'P0001';
  end if;
  update public.meeting_speakers
  set person_id = p_person_id
  where meeting_id = p_meeting_id and label = p_label;
  if not found then
    raise exception 'That speaker is not in the transcript.' using errcode = 'P0002';
  end if;
  perform public.recount_participation(p_meeting_id);
end;
$$;

revoke execute on function public.recount_participation(uuid) from public, anon;
revoke execute on function public.name_speaker(uuid, text, uuid) from public, anon;
grant execute on function public.recount_participation(uuid) to authenticated, service_role;
grant execute on function public.name_speaker(uuid, text, uuid) to authenticated, service_role;

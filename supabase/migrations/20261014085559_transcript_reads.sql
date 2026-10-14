-- The transcript reads: each line with the person its speaker label stands for, and the search
-- over a whole transcript.

-- speaker_person_id is null while nobody has said who a label is ("Speaker A").
create view public.transcript_lines with (security_invoker = true) as
select
  s.id,
  s.meeting_id,
  s.position,
  s.speaker_label,
  sp.person_id as speaker_person_id,
  s.start_sec,
  s.end_sec,
  s.text,
  s.sentiment
from public.transcript_segments s
left join public.meeting_speakers sp
  on sp.meeting_id = s.meeting_id and sp.label = s.speaker_label;

revoke all on public.transcript_lines from anon;
grant select on public.transcript_lines to authenticated, service_role;

-- Every line of a meeting that holds `q`, in spoken order, with how many times it does: hits
-- counted without overlap and ignoring case, as the mock counted them. With from_sec and to_sec,
-- only the lines that overlap that part of the meeting.
create function public.search_transcript(
  p_meeting_id uuid,
  p_q text,
  p_from_sec real default null,
  p_to_sec real default null
)
returns table (segment_id uuid, hits integer)
language sql stable set search_path = '' as $$
  with term as (select lower(trim(p_q)) as needle)
  select
    s.id,
    ((length(lower(s.text)) - length(replace(lower(s.text), term.needle, '')))
      / length(term.needle))::integer
  from public.transcript_segments s, term
  where s.meeting_id = p_meeting_id
    and length(term.needle) > 0
    and strpos(lower(s.text), term.needle) > 0
    and (p_from_sec is null or s.end_sec >= p_from_sec)
    and (p_to_sec is null or s.start_sec <= p_to_sec)
  order by s.position;
$$;

revoke execute on function public.search_transcript(uuid, text, real, real) from public, anon;
grant execute on function public.search_transcript(uuid, text, real, real)
  to authenticated, service_role;

-- The real upload: a private bucket for the files, and one call that makes the meeting with its
-- people once the file is in.

-- 50 MB is the most a file can be on the Free plan; the form says so before it sends anything.
insert into storage.buckets (id, name, public, file_size_limit)
values ('meeting-files', 'meeting-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- Signed-in members put files in, read them and take them out; nobody else sees the bucket.
create policy "Members upload meeting files" on storage.objects
  for insert to authenticated with check (bucket_id = 'meeting-files');
create policy "Members read meeting files" on storage.objects
  for select to authenticated using (bucket_id = 'meeting-files');
create policy "Members delete meeting files" on storage.objects
  for delete to authenticated using (bucket_id = 'meeting-files');

-- The meeting of an uploaded file, processing, with the people who took part, in one
-- transaction: a failed participant leaves no half-made meeting behind.
create function public.create_upload(
  p_title text,
  p_project_id uuid,
  p_source_kind text,
  p_source_file_name text,
  p_source_path text,
  p_participant_ids uuid[]
)
returns public.meetings
language plpgsql set search_path = '' as $$
declare
  v_meeting public.meetings;
begin
  if coalesce(array_length(p_participant_ids, 1), 0) = 0 then
    raise exception 'Pick who took part in the meeting.' using errcode = 'P0001';
  end if;

  insert into public.meetings
    (title, project_id, status, source_kind, source_file_name, source_path)
  values (p_title, p_project_id, 'processing', p_source_kind, p_source_file_name, p_source_path)
  returning * into v_meeting;

  insert into public.meeting_participants (meeting_id, person_id)
  select v_meeting.id, person_id
  from unnest(p_participant_ids) as person_id
  on conflict do nothing;

  return v_meeting;
end;
$$;

revoke execute on function public.create_upload(text, uuid, text, text, text, uuid[])
  from public, anon;
grant execute on function public.create_upload(text, uuid, text, text, text, uuid[])
  to authenticated, service_role;

-- A person as the people table shows them: how many meetings they took part in and how many
-- open tasks they own, counted by the database. The search looks in the name, role and email.

create view public.people_rows with (security_invoker = true) as
select
  p.id,
  p.name,
  p.role,
  p.email,
  p.avatar_tone,
  p.user_id,
  p.created_at,
  (select count(*) from public.meeting_participants mp where mp.person_id = p.id)
    as meeting_count,
  (select count(*) from public.action_items a where a.owner_id = p.id and a.status <> 'done')
    as open_task_count,
  p.name || ' ' || p.role || ' ' || coalesce(p.email, '') as search_text
from public.people p;

revoke all on public.people_rows from anon;
grant select on public.people_rows to authenticated, service_role;

-- The real teams, projects and people, edited by hand. Nothing from src/mock/seed/ goes here:
-- meetings come from uploads. Run on the linked project with
--   npx supabase db push --include-seed
-- Each insert skips rows that are already there, so running it again is safe.

-- Teams.
insert into public.teams (name) values
  ('MeetMind')
on conflict (name) do nothing;

-- Projects, each in one team.
insert into public.projects (team_id, name)
select t.id, p.name
from (values
  ('MeetMind', 'MeetMind AI')
) as p (team_name, name)
join public.teams t on t.name = p.team_name
on conflict (team_id, name) do nothing;

-- People. The avatar hue is picked by the database. user_id is set after the person is invited
-- and signs in (Task 16).
insert into public.people (name, role, email) values
  ('Tofiq Huseynli', 'Frontend Developer', 'tofiq789@gmail.com')
on conflict (email) do nothing;

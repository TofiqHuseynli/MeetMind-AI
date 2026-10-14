-- A signed-in user is linked to the person with the same email. Invitations create the account
-- in auth.users; this links it on the spot, and again if the account's email changes, so the
-- sidebar can name the user and the app knows which person they are.

create function public.link_person_to_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.people
  set user_id = new.id
  where lower(email) = lower(new.email)
    and (user_id is null or user_id = new.id);
  return new;
end;
$$;

create trigger on_auth_user_linked
  after insert or update of email on auth.users
  for each row execute function public.link_person_to_user();

revoke execute on function public.link_person_to_user() from public, anon, authenticated;

-- Accounts made before this migration.
update public.people p
set user_id = u.id
from auth.users u
where lower(p.email) = lower(u.email)
  and p.user_id is null;

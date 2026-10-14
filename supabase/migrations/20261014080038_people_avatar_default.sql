-- A new person's hue is picked by the service, so callers leave it out. The column needs a
-- default for that, or the generated insert type asks for it; 'auto' is the placeholder the
-- trigger replaces before the row is checked and stored.
alter table public.people alter column avatar_tone set default 'auto';

create or replace function public.pick_avatar_tone() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.avatar_tone is null or new.avatar_tone = 'auto' then
    new.avatar_tone := 'speaker-' || ((select count(*) from public.people) % 6 + 1);
  end if;
  return new;
end;
$$;

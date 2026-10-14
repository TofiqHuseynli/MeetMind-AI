import type {
  CursorPage,
  MinListItem,
  MinListQuery,
  PeopleMinListQuery,
  Person,
  Project,
  ProjectMinListQuery,
  ProjectSearch,
  Team,
} from "@/types";
import { supabase } from "../client";
import { toPerson, toProject, toTeam } from "../mappers/reference";
import { containsPattern, cursorStart, isUuid, rows, toCursorPage } from "./query";

// Teams, projects and people: the whole lists for the lookups, and batches for the pickers.
// Every list is by name, then by id so a batch never repeats a row.

export async function listTeams(): Promise<Team[]> {
  const found = rows(await supabase().from("teams").select("*").order("name").order("id"));
  return found.map(toTeam);
}

export async function listProjects(): Promise<Project[]> {
  const found = rows(await supabase().from("projects").select("*").order("name").order("id"));
  return found.map(toProject);
}

export async function listPeople(): Promise<Person[]> {
  const found = rows(await supabase().from("people").select("*").order("name").order("id"));
  return found.map(toPerson);
}

/** Projects whose name holds `q`, by name, `limit` at a time. */
export async function searchProjects(search: ProjectSearch): Promise<CursorPage<Project>> {
  let request = supabase().from("projects").select("*");
  if (search.q?.trim()) request = request.ilike("name", containsPattern(search.q));
  const start = cursorStart(search.cursor);
  const found = rows(
    await request.order("name").order("id").range(start, start + search.limit),
  );
  return toCursorPage(found.map(toProject), search.cursor, search.limit);
}

/** The team choices of a select, by name. */
export async function teamMinList(query: MinListQuery): Promise<CursorPage<MinListItem>> {
  let request = supabase().from("teams").select("id, name");
  if (query.q?.trim()) request = request.ilike("name", containsPattern(query.q));
  const start = cursorStart(query.cursor);
  const found = rows(await request.order("name").order("id").range(start, start + query.limit));
  return toCursorPage(found, query.cursor, query.limit);
}

/** The project choices, only one team's with `teamId`. */
export async function projectMinList(
  query: ProjectMinListQuery,
): Promise<CursorPage<MinListItem>> {
  let request = supabase().from("projects").select("id, name");
  if (query.teamId) request = request.eq("team_id", query.teamId);
  if (query.q?.trim()) request = request.ilike("name", containsPattern(query.q));
  const start = cursorStart(query.cursor);
  const found = rows(await request.order("name").order("id").range(start, start + query.limit));
  return toCursorPage(found, query.cursor, query.limit);
}

/** People by name or role; with `meetingId`, only that meeting's people. */
export async function peopleMinList(
  query: PeopleMinListQuery,
): Promise<CursorPage<MinListItem>> {
  if (query.meetingId && !isUuid(query.meetingId)) return { items: [], nextCursor: null };
  // The inner join to the participants keeps only that meeting's people.
  let request = query.meetingId
    ? supabase()
        .from("people")
        .select("id, name, meeting_participants!inner(meeting_id)")
        .eq("meeting_participants.meeting_id", query.meetingId)
    : supabase().from("people").select("id, name");
  if (query.q?.trim()) {
    const pattern = containsPattern(query.q);
    request = request.or(`name.ilike.${pattern},role.ilike.${pattern}`);
  }
  const start = cursorStart(query.cursor);
  const found = rows(await request.order("name").order("id").range(start, start + query.limit));
  const items = found.map(({ id, name }) => ({ id, name }));
  return toCursorPage(items, query.cursor, query.limit);
}

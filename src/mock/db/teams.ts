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
import { delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import { batch } from "./batch";
import { copy, db } from "./store";

// Teams, projects and people never change in the demo, so they are read from the seed.

export async function listTeams(): Promise<Team[]> {
  await delay();
  return copy(seed.teams);
}

export async function listProjects(): Promise<Project[]> {
  await delay();
  return copy(seed.projects);
}

export async function listPeople(): Promise<Person[]> {
  await delay();
  return copy(seed.people);
}

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
}

/** Projects whose name holds `q`, by name, `limit` at a time. */
export async function searchProjects(search: ProjectSearch): Promise<CursorPage<Project>> {
  await delay();
  const q = search.q?.trim().toLowerCase();
  const matches = seed.projects
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .sort(byName);
  return batch(matches, search);
}

/**
 * The choices of a select: the items whose searched text holds `q`, by name, `limit` at a
 * time, as id and name only.
 */
function minList<T extends MinListItem>(
  items: T[],
  query: MinListQuery,
  text: (item: T) => string = (item) => item.name,
): CursorPage<MinListItem> {
  const q = query.q?.trim().toLowerCase();
  const matches = items
    .filter((item) => !q || text(item).toLowerCase().includes(q))
    .sort(byName)
    .map(({ id, name }) => ({ id, name }));
  return batch(matches, query);
}

export async function teamMinList(query: MinListQuery): Promise<CursorPage<MinListItem>> {
  await delay();
  return minList(seed.teams, query);
}

export async function projectMinList(
  query: ProjectMinListQuery,
): Promise<CursorPage<MinListItem>> {
  await delay();
  const projects = seed.projects.filter((p) => !query.teamId || p.teamId === query.teamId);
  return minList(projects, query);
}

/** People by name or role; with `meetingId`, only that meeting's people. */
export async function peopleMinList(query: PeopleMinListQuery): Promise<CursorPage<MinListItem>> {
  await delay();
  const meeting = query.meetingId ? db().meetings.get(query.meetingId) : undefined;
  const people = seed.people.filter((p) => !meeting || meeting.participantIds.includes(p.id));
  return minList(people, query, (person) => `${person.name} ${person.role}`);
}

import type {
  MeetingListQuery,
  MeetingMinListQuery,
  PeopleMinListQuery,
  ProjectMinListQuery,
} from "@/types";

// Apart from the hooks, so other features can invalidate these without importing them.

/** A min list hook's input: the query without the batch fields the hook adds. */
export type MinListQueryInput<T> = Omit<T, "cursor" | "limit"> & { q: string };

export const meetingKeys = {
  all: ["meetings"] as const,
  lists: ["meetings", "list"] as const,
  list: (query: MeetingListQuery) => ["meetings", "list", query] as const,
  minList: (query: MinListQueryInput<MeetingMinListQuery>) =>
    ["meetings", "min-list", query] as const,
  detail: (id: string) => ["meetings", "detail", id] as const,
  decisions: (id: string) => ["meetings", "detail", id, "decisions"] as const,
};

// Teams, projects and people never change in the demo, so they are fetched once.
export const referenceKeys = {
  teams: ["teams"] as const,
  projects: ["projects"] as const,
  projectSearch: (q: string) => ["projects", "search", q] as const,
  people: ["people"] as const,
  teamMinList: (q: string) => ["teams", "min-list", q] as const,
  projectMinList: (query: MinListQueryInput<ProjectMinListQuery>) =>
    ["projects", "min-list", query] as const,
  peopleMinList: (query: MinListQueryInput<PeopleMinListQuery>) =>
    ["people", "min-list", query] as const,
};

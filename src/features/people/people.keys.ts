import type { PersonListQuery } from "@/types";

// Apart from the hooks, so other features can invalidate these without importing them. They
// share the "people" root with the reference lists in meetings.keys.ts, so one invalidation of
// peopleKeys.all reaches every list of people: this table, the lookups and the pickers.
export const peopleKeys = {
  all: ["people"] as const,
  list: (query: PersonListQuery) => ["people", "list", query] as const,
};

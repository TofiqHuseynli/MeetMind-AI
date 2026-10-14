import type {
  Page,
  Person,
  PersonListItem,
  PersonListQuery,
  PersonSortField,
} from "@/types";
import { supabase } from "../client";
import { toPerson, toPersonListItem } from "../mappers/reference";
import { containsPattern, pageRange, rows } from "./query";

const sortColumn: Record<PersonSortField, string> = {
  name: "name",
  role: "role",
  meetings: "meeting_count",
};

/** A person's fields as the people dialog sends them. The hue is the service's to pick. */
export type PersonFields = { name: string; role: string; email: string | null };

/** One page of people, searched, counted and sorted by the database; ties by name, then id. */
export async function listPeoplePage(query: PersonListQuery): Promise<Page<PersonListItem>> {
  let request = supabase().from("people_rows").select("*", { count: "exact" });
  if (query.filter.q?.trim()) {
    request = request.ilike("search_text", containsPattern(query.filter.q));
  }
  const [from, to] = pageRange(query.page, query.pageSize);
  const result = await request
    .order(sortColumn[query.sort.field], { ascending: query.sort.direction === "asc" })
    .order("name", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);
  return { items: rows(result).map(toPersonListItem), total: result.count ?? 0 };
}

// 23505 is a unique key: another person has that email.
function writeError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") return new Error("Someone on the team already has that email.");
  return new Error(error.message);
}

export async function createPerson(fields: PersonFields): Promise<Person> {
  const { data, error } = await supabase().from("people").insert(fields).select().single();
  if (error) throw writeError(error);
  return toPerson(data);
}

/** By trusted id: a person who is gone is reported, not made again. */
export async function updatePerson(id: string, fields: PersonFields): Promise<Person> {
  const { data, error } = await supabase()
    .from("people")
    .update(fields)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw writeError(error);
  if (!data) throw new Error("This person was deleted.");
  return toPerson(data);
}

/**
 * Removes a person nobody points at yet. Someone who took part in a meeting or owns a task stays:
 * the database refuses (23503), and the message says why.
 */
export async function deletePerson(id: string): Promise<void> {
  const { error } = await supabase().from("people").delete().eq("id", id);
  if (error?.code === "23503") {
    throw new Error("They took part in meetings or own tasks, so they stay on the team.");
  }
  if (error) throw new Error(error.message);
}

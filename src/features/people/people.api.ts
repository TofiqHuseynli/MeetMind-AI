import * as db from "@/supabase/db/people";
import type { Page, Person, PersonListItem, PersonListQuery } from "@/types";
import {
  personFieldsSchema,
  personRefSchema,
  updatePersonSchema,
  type PersonFieldsInput,
  type PersonRef,
  type UpdatePersonInput,
} from "./people.schema";

// Everything here reads and writes Supabase (src/supabase/db/people.ts).

export function fetchPeoplePage(query: PersonListQuery): Promise<Page<PersonListItem>> {
  return db.listPeoplePage(query);
}

/** An empty email is no email: the column holds null, so two people can both have none. */
function toFields(input: PersonFieldsInput): db.PersonFields {
  return { name: input.name, role: input.role, email: input.email || null };
}

export async function createPerson(input: PersonFieldsInput): Promise<Person> {
  return db.createPerson(toFields(personFieldsSchema.parse(input)));
}

export async function updatePerson(input: UpdatePersonInput): Promise<Person> {
  const { id, ...fields } = updatePersonSchema.parse(input);
  return db.updatePerson(id, toFields(fields));
}

export async function deletePerson(input: PersonRef): Promise<void> {
  const { id } = personRefSchema.parse(input);
  return db.deletePerson(id);
}

import {
  AVATAR_TONES,
  type Person,
  type PersonListItem,
  type Project,
  type Team,
} from "@/types";
import type { Tables } from "../database.types";
import { initialsOf, oneOf, required } from "./rows";

export function toTeam(row: Tables<"teams">): Team {
  return { id: row.id, name: row.name };
}

export function toProject(row: Tables<"projects">): Project {
  return { id: row.id, name: row.name, teamId: row.team_id };
}

export function toPerson(row: Tables<"people">): Person {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: {
      initials: initialsOf(row.name),
      tone: oneOf(row.avatar_tone, AVATAR_TONES, "people.avatar_tone"),
    },
  };
}

/** A row of the people_rows view: the person with their meeting and open task counts. */
export function toPersonListItem(row: Tables<"people_rows">): PersonListItem {
  const name = required(row.name, "people.name");
  return {
    id: required(row.id, "people.id"),
    name,
    role: row.role ?? "",
    avatar: {
      initials: initialsOf(name),
      tone: oneOf(row.avatar_tone, AVATAR_TONES, "people.avatar_tone"),
    },
    email: row.email,
    meetingCount: row.meeting_count ?? 0,
    openTaskCount: row.open_task_count ?? 0,
  };
}

import { AVATAR_TONES, type Person, type Project, type Team } from "@/types";
import type { Tables } from "../database.types";
import { initialsOf, oneOf } from "./rows";

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

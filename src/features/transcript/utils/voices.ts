import type { Person } from "@/types";

/** Everyone on the team who may be a voice, those who took part first. */
export function voiceCandidates(personById: Map<string, Person>, participantIds: string[]) {
  const took = new Set(participantIds);
  return [...personById.values()].sort(
    (a, b) => Number(took.has(b.id)) - Number(took.has(a.id)),
  );
}

/** A label as an id fragment: "Person 1" becomes "Person-1". */
export function voiceIdOf(label: string): string {
  return label.replace(/\W+/g, "-");
}

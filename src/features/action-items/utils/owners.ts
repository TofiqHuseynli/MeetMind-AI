import type { Person } from "@/types";

/**
 * Who can own a task, in two groups: the meeting's people first, then the rest of the team, so
 * work can go to someone who was not in the meeting. Each group keeps its own order.
 */
export function ownerGroups(
  participants: Person[],
  everyone: Person[],
): { inMeeting: Person[]; others: Person[] } {
  const inMeeting = new Set(participants.map((person) => person.id));
  return {
    inMeeting: participants,
    others: everyone.filter((person) => !inMeeting.has(person.id)),
  };
}

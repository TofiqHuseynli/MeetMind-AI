import type { ActionCounts, Meeting, MeetingFilter } from "@/types";
import { isInDayRange } from "@/utils/day-range";

// The meeting filter the lists share: the meetings themselves, and the action items by the
// meeting they belong to.

// `counts` exist only where the caller computed them; elsewhere the overdue filter is ignored.
export function matchesFilter(
  meeting: Meeting,
  filter: MeetingFilter,
  counts?: ActionCounts | null,
): boolean {
  if (filter.projectId && meeting.projectId !== filter.projectId) return false;
  if (filter.teamId && meeting.teamId !== filter.teamId) return false;
  if (filter.status && meeting.status !== filter.status) return false;
  if (filter.sentiment && meeting.sentiment?.label !== filter.sentiment) return false;
  if (filter.personId && !meeting.participantIds.includes(filter.personId)) return false;
  if (filter.date && !isInDayRange(meeting.date, filter.date)) return false;
  if (filter.overdue && counts !== undefined && !counts?.overdue) return false;
  if (filter.q) {
    const q = filter.q.toLowerCase();
    const haystack = `${meeting.title} ${meeting.summary.join(" ")}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

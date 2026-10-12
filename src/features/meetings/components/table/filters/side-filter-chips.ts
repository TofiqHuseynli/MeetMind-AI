import type { FilterChip } from "@/components/data-table/filter-chips";
import type { MeetingFilter, Person } from "@/types";
import { dayRangeLabel } from "@/utils/day-range";
import { meetingStatusLabel, sentimentLabel } from "../../../meetings.constants";

/** The active side-panel filters as chips, in the panel's order. */
export function sideFilterChips(
  filter: MeetingFilter,
  personById: Map<string, Person>,
  onChange: (patch: Partial<MeetingFilter>) => void,
): FilterChip[] {
  const chips: FilterChip[] = [];
  const add = (key: keyof MeetingFilter, label: string, value: string) =>
    chips.push({ key, label, value, onRemove: () => onChange({ [key]: undefined }) });

  if (filter.status) add("status", "Status", meetingStatusLabel[filter.status]);
  if (filter.sentiment) add("sentiment", "Sentiment", sentimentLabel[filter.sentiment]);
  if (filter.personId) {
    add("personId", "Participant", personById.get(filter.personId)?.name ?? filter.personId);
  }
  if (filter.date) add("date", "Date", dayRangeLabel(filter.date));
  if (filter.overdue) add("overdue", "Tasks", "Overdue");
  return chips;
}

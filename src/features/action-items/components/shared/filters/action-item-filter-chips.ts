import type { FilterChip } from "@/components/data-table/filter-chips";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import {
  UPCOMING_DAY_RANGE_PRESETS,
  type ActionItemFilter,
  type Person,
  type Project,
  type Team,
} from "@/types";
import { dayRangeLabel } from "@/utils/day-range";

/** The active side-panel filters as chips, in the panel's order. */
export function actionItemFilterChips(
  filter: ActionItemFilter,
  lookups: {
    personById: Map<string, Person>;
    teamById?: Map<string, Team>;
    projectById?: Map<string, Project>;
  },
  onChange: (patch: Partial<ActionItemFilter>) => void,
): FilterChip[] {
  const chips: FilterChip[] = [];
  const add = (key: keyof ActionItemFilter, label: string, value: string) =>
    chips.push({ key, label, value, onRemove: () => onChange({ [key]: undefined }) });

  if (filter.priority) add("priority", "Priority", priorityLabel[filter.priority]);
  if (filter.ownerId) {
    add("ownerId", "Owner", lookups.personById.get(filter.ownerId)?.name ?? filter.ownerId);
  }
  if (filter.teamId) {
    add("teamId", "Team", lookups.teamById?.get(filter.teamId)?.name ?? filter.teamId);
  }
  if (filter.projectId) {
    const name = lookups.projectById?.get(filter.projectId)?.name;
    add("projectId", "Project", name ?? filter.projectId);
  }
  if (filter.due) add("due", "Due", dayRangeLabel(filter.due, UPCOMING_DAY_RANGE_PRESETS));
  return chips;
}

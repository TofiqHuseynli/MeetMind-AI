import { useId } from "react";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { FilterField } from "@/components/data-table/filter-field";
import { FilterPanel } from "@/components/data-table/filter-panel";
import { FilterSelect } from "@/components/data-table/filter-select";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import { countActionItemSideFilters } from "@/features/action-items/utils/list-query";
import { ProjectFilter } from "@/features/meetings/components/table/filters/project-filter";
import { TeamFilter } from "@/features/meetings/components/table/filters/team-filter";
import {
  UPCOMING_DAY_RANGE_PRESETS,
  type ActionItemFilter,
  type Person,
  type Project,
  type Team,
} from "@/types";
import { labelOptions } from "@/utils/options";
import { PersonFilter } from "@/features/meetings/components/table/filters/person-filter";

const priorityOptions = labelOptions(priorityLabel);

const noSideFilters: Partial<ActionItemFilter> = {
  priority: undefined,
  ownerId: undefined,
  teamId: undefined,
  projectId: undefined,
  due: undefined,
};

/**
 * The action item filters that live in the right-hand panel: priority, owner, across meetings
 * (with `teamById` and `projectById`) team and project, then the due days. The toolbar keeps the
 * main ones.
 */
export function ActionItemSideFilters({
  meetingId,
  filter,
  personById,
  teamById,
  projectById,
  onChange,
}: {
  meetingId?: string;
  filter: ActionItemFilter;
  personById: Map<string, Person>;
  teamById?: Map<string, Team>;
  projectById?: Map<string, Project>;
  onChange: (patch: Partial<ActionItemFilter>) => void;
}) {
  const id = useId();

  return (
    <FilterPanel count={countActionItemSideFilters(filter)} onClear={() => onChange(noSideFilters)}>
      <FilterField label="Priority" htmlFor={`${id}-priority`}>
        <FilterSelect
          id={`${id}-priority`}
          label="Priority"
          allLabel="Any priority"
          value={filter.priority}
          options={priorityOptions}
          onChange={(priority) => onChange({ priority })}
          className="w-full"
        />
      </FilterField>
      <FilterField label="Owner" htmlFor={`${id}-owner`}>
        <PersonFilter
          id={`${id}-owner`}
          label="Owner"
          allLabel="All owners"
          meetingId={meetingId}
          value={filter.ownerId}
          personById={personById}
          onChange={(ownerId) => onChange({ ownerId })}
          className="w-full"
        />
      </FilterField>
      {teamById && (
        <FilterField label="Team" htmlFor={`${id}-team`}>
          <TeamFilter
            id={`${id}-team`}
            value={filter.teamId}
            teamById={teamById}
            onChange={(teamId) => onChange({ teamId })}
            className="w-full"
          />
        </FilterField>
      )}
      {projectById && (
        <FilterField label="Project" htmlFor={`${id}-project`}>
          <ProjectFilter
            id={`${id}-project`}
            value={filter.projectId}
            teamId={filter.teamId}
            projectById={projectById}
            onChange={(projectId) => onChange({ projectId })}
            className="w-full"
          />
        </FilterField>
      )}
      <FilterField label="Due date" htmlFor={`${id}-due`}>
        <DateRangePicker
          id={`${id}-due`}
          value={filter.due}
          presets={UPCOMING_DAY_RANGE_PRESETS}
          onChange={(due) => onChange({ due })}
          className="w-full"
        />
      </FilterField>
    </FilterPanel>
  );
}

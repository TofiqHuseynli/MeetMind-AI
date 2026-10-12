import { useId } from "react";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { FilterField } from "@/components/data-table/filter-field";
import { FilterPanel } from "@/components/data-table/filter-panel";
import { FilterSelect } from "@/components/data-table/filter-select";
import { Checkbox } from "@/components/ui/checkbox";
import type { MeetingFilter, Person } from "@/types";
import { PersonFilter } from "./person-filter";
import { countSideFilters } from "../../../utils/list-query";
import { labelOptions } from "@/utils/options";
import { meetingStatusLabel, sentimentLabel } from "../../../meetings.constants";

const statusOptions = labelOptions(meetingStatusLabel);
const sentimentOptions = labelOptions(sentimentLabel);

const noSideFilters: Partial<MeetingFilter> = {
  status: undefined,
  sentiment: undefined,
  personId: undefined,
  date: undefined,
  overdue: undefined,
};

/** The meeting filters that live in the right-hand panel; the toolbar keeps the main ones. */
export function SideFilters({
  filter,
  personById,
  onChange,
}: {
  filter: MeetingFilter;
  personById: Map<string, Person>;
  onChange: (patch: Partial<MeetingFilter>) => void;
}) {
  const id = useId();

  return (
    <FilterPanel count={countSideFilters(filter)} onClear={() => onChange(noSideFilters)}>
      <FilterField label="Status" htmlFor={`${id}-status`}>
        <FilterSelect
          id={`${id}-status`}
          label="Status"
          allLabel="Any status"
          value={filter.status}
          options={statusOptions}
          onChange={(status) => onChange({ status })}
          className="w-full"
        />
      </FilterField>
      <FilterField label="Sentiment" htmlFor={`${id}-sentiment`}>
        <FilterSelect
          id={`${id}-sentiment`}
          label="Sentiment"
          allLabel="Any sentiment"
          value={filter.sentiment}
          options={sentimentOptions}
          onChange={(sentiment) => onChange({ sentiment })}
          className="w-full"
        />
      </FilterField>
      <FilterField label="Participant" htmlFor={`${id}-person`}>
        <PersonFilter
          id={`${id}-person`}
          label="Participant"
          allLabel="Anyone"
          value={filter.personId}
          personById={personById}
          onChange={(personId) => onChange({ personId })}
          className="w-full"
        />
      </FilterField>
      <FilterField label="Date" htmlFor={`${id}-date`}>
        <DateRangePicker
          id={`${id}-date`}
          value={filter.date}
          onChange={(date) => onChange({ date })}
          className="w-full"
        />
      </FilterField>
      <FilterField label="Tasks">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id={`${id}-overdue`}
            checked={Boolean(filter.overdue)}
            onCheckedChange={(checked) => onChange({ overdue: checked === true || undefined })}
          />
          <label htmlFor={`${id}-overdue`} className="cursor-pointer text-[13px]">
            Only meetings with overdue tasks
          </label>
        </div>
      </FilterField>
    </FilterPanel>
  );
}

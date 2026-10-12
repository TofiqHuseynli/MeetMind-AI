import { X } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "@/components/common/date-range-picker";
import { SearchField } from "@/components/common/search-field";
import { FilterChips } from "@/components/data-table/filter-chips";
import { FilterSelect } from "@/components/data-table/filter-select";
import { Button } from "@/components/ui/button";
import { actionStatusLabel } from "@/features/action-items/action-items.constants";
import { hasActionItemFilter } from "@/features/action-items/utils/list-query";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { ActionItemFilter, Person, Project, Team } from "@/types";
import { labelOptions } from "@/utils/options";
import { actionItemFilterChips } from "./action-item-filter-chips";
import { ActionItemSideFilters } from "./action-item-side-filters";

const statusOptions = labelOptions(actionStatusLabel);

/**
 * The action items toolbar: search, status, across meetings the days the items were made on,
 * the "Filters" panel for the rest, and a reset while any is set. Panel filters show as chips on
 * a second line; their "Clear all" takes the reset's place. The board turns the status select
 * off (`statusFilter`): its columns are the statuses.
 */
export function ActionItemFilters({
  meetingId,
  statusFilter = true,
  filter,
  personById,
  teamById,
  projectById,
  onChange,
  onClear,
}: {
  /** The one meeting whose items the table shows; without it, every meeting's. */
  meetingId?: string;
  statusFilter?: boolean;
  filter: ActionItemFilter;
  /** Name the chosen owner, team and project, whose rows may not be among the loaded batches. */
  personById: Map<string, Person>;
  teamById?: Map<string, Team>;
  projectById?: Map<string, Project>;
  onChange: (patch: Partial<ActionItemFilter>, options?: { replace?: boolean }) => void;
  onClear: () => void;
}) {
  const urlQ = filter.q ?? "";
  const [q, setQ] = useState(urlQ);
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  // "Clear filters" and the back button change `q` from outside; take it over.
  if (urlQ !== seenUrlQ) {
    setSeenUrlQ(urlQ);
    setQ(urlQ);
  }

  const pushQ = useDebouncedCallback(
    (value: string) => onChange({ q: value.trim() || undefined }, { replace: true }),
  );

  const chips = actionItemFilterChips(filter, { personById, teamById, projectById }, onChange);

  return (
    <>
      <SearchField
        value={q}
        onChange={(value) => {
          setQ(value);
          pushQ(value);
        }}
        label="Search action items"
        placeholder="Search task or owner"
        className="min-w-50 flex-1 sm:max-w-80"
      />

      {statusFilter && (
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          value={filter.status}
          options={statusOptions}
          onChange={(status) => onChange({ status })}
        />
      )}

      {!meetingId && (
        <DateRangePicker
          label="Created"
          value={filter.created}
          onChange={(created) => onChange({ created })}
          className="w-auto min-w-40 bg-card font-semibold text-foreground hover:bg-muted"
        />
      )}

      <ActionItemSideFilters
        meetingId={meetingId}
        filter={filter}
        personById={personById}
        teamById={teamById}
        projectById={projectById}
        onChange={onChange}
      />

      {hasActionItemFilter(filter) && chips.length === 0 && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Reset
          <X aria-hidden />
        </Button>
      )}

      <FilterChips chips={chips} onClearAll={onClear} />
    </>
  );
}

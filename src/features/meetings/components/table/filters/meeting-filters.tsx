import { Search, X } from "lucide-react";
import { useState } from "react";
import { FilterChips } from "@/components/data-table/filter-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";
import type { MeetingFilter, Person, Project, Team } from "@/types";
import { hasActiveFilter } from "../../../utils/list-query";
import { ProjectFilter } from "./project-filter";
import { sideFilterChips } from "./side-filter-chips";
import { SideFilters } from "./side-filters";
import { TeamFilter } from "./team-filter";

/**
 * The meeting table's toolbar: search, team, project, the "Filters" panel for the rest, and a
 * reset while any is set. Panel filters show as chips on a second line; their "Clear all"
 * takes the reset's place.
 */
export function MeetingFilters({
  filter,
  teamById,
  projectById,
  personById,
  onChange,
  onClear,
}: {
  filter: MeetingFilter;
  teamById: Map<string, Team>;
  projectById: Map<string, Project>;
  personById: Map<string, Person>;
  onChange: (patch: Partial<MeetingFilter>, options?: { replace?: boolean }) => void;
  onClear: () => void;
}) {
  const urlQ = filter.q ?? "";
  const [q, setQ] = useState(urlQ);
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  // The top bar can change `q` from outside; take it over without losing local typing.
  // Our own push comes back trimmed; taking it over would eat a space the user just typed.
  if (urlQ !== seenUrlQ) {
    setSeenUrlQ(urlQ);
    if (urlQ !== q.trim()) setQ(urlQ);
  }

  const pushQ = useDebouncedCallback(
    (value: string) => onChange({ q: value.trim() || undefined }, { replace: true }),
  );

  const chips = sideFilterChips(filter, personById, onChange);

  return (
    <>
      <div className="relative min-w-50 flex-1 sm:max-w-80">
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
            "text-subtle-foreground",
          )}
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            pushQ(e.target.value);
          }}
          placeholder="Search title or summary"
          aria-label="Search meetings"
          className="pl-9"
        />
      </div>

      <TeamFilter
        value={filter.teamId}
        teamById={teamById}
        onChange={(teamId) => onChange({ teamId })}
      />

      <ProjectFilter
        value={filter.projectId}
        teamId={filter.teamId}
        projectById={projectById}
        onChange={(projectId) => onChange({ projectId })}
      />

      <SideFilters filter={filter} personById={personById} onChange={onChange} />

      {hasActiveFilter(filter) && chips.length === 0 && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Reset
          <X aria-hidden />
        </Button>
      )}

      <FilterChips chips={chips} onClearAll={onClear} />
    </>
  );
}

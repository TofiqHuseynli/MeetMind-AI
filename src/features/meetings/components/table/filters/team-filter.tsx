import { useState } from "react";
import { SearchSelect } from "@/components/data-table/search-select";
import type { Team } from "@/types";
import { minListOptions } from "@/utils/min-list";
import { useTeamMinList } from "../../../meetings.queries";

/** The team filter of the meeting list: teams searched by the service while the list is open. */
export function TeamFilter({
  value,
  teamById,
  onChange,
  id,
  className,
}: {
  value: string | undefined;
  teamById: Map<string, Team>;
  onChange: (teamId: string | undefined) => void;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const teams = useTeamMinList(term, open);

  return (
    <SearchSelect
      id={id}
      className={className}
      label="Team"
      allLabel="All teams"
      value={value}
      valueLabel={value ? teamById.get(value)?.name : undefined}
      options={minListOptions(teams.data)}
      query={teams}
      emptyWhat="No team"
      searchPlaceholder="Search teams"
      onChange={onChange}
      onOpenChange={setOpen}
      onTermChange={setTerm}
    />
  );
}

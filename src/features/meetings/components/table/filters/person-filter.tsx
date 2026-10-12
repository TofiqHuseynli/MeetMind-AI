import { useState } from "react";
import { PersonAvatar } from "@/components/common/person-avatar";
import { SearchSelect } from "@/components/data-table/search-select";
import type { Person } from "@/types";
import { minListOptions } from "@/utils/min-list";
import { usePeopleMinList } from "../../../meetings.queries";

/**
 * A person filter (an owner, a participant): the people, one meeting's with `meetingId`,
 * searched by the service and read in batches while the list is open.
 */
export function PersonFilter({
  label,
  allLabel,
  meetingId,
  value,
  personById,
  onChange,
  id,
  className,
}: {
  /** Names the field for screen readers ("Owner", "Participant"). */
  label: string;
  allLabel: string;
  meetingId?: string;
  value: string | undefined;
  /** Names the chosen person, whose row may not be among the loaded batches. */
  personById: Map<string, Person>;
  onChange: (personId: string | undefined) => void;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const people = usePeopleMinList({ q: term, meetingId }, open);

  return (
    <SearchSelect
      id={id}
      className={className}
      label={label}
      allLabel={allLabel}
      value={value}
      valueLabel={value ? personById.get(value)?.name : undefined}
      options={minListOptions(people.data)}
      renderOption={(option, name) => {
        const person = personById.get(option.value);
        return (
          <>
            {person && <PersonAvatar person={person} size="sm" tooltip={false} />}
            <span className="truncate">{name}</span>
          </>
        );
      }}
      query={people}
      emptyWhat="No one"
      searchPlaceholder="Search by name or role"
      onChange={onChange}
      onOpenChange={setOpen}
      onTermChange={setTerm}
    />
  );
}

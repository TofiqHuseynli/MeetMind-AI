import { UserPlus } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Person } from "@/types";

// The last item opens the new person dialog instead of choosing someone.
const NEW_PERSON = "new-person";

function PersonItem({ person }: { person: Person }) {
  return (
    <SelectItem value={person.id}>
      <PersonAvatar person={person} size="sm" tooltip={false} />
      {person.name}
    </SelectItem>
  );
}

/**
 * Who owns a task: the meeting's people first, then the rest of the team, and at the end a way
 * to add someone new. Until the meeting is known it waits, disabled, with `waitingLabel`.
 */
export function OwnerSelect({
  id,
  value,
  onChange,
  inMeeting,
  others,
  waitingLabel,
  invalid,
  describedBy,
  onNewPerson,
}: {
  id: string;
  value: string;
  onChange: (personId: string) => void;
  inMeeting: Person[];
  others: Person[];
  waitingLabel: string;
  invalid: boolean;
  describedBy?: string;
  onNewPerson: () => void;
}) {
  const waiting = inMeeting.length === 0;

  return (
    <Select
      value={value}
      onValueChange={(next) => (next === NEW_PERSON ? onNewPerson() : onChange(next))}
      disabled={waiting}
    >
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="w-full"
      >
        <SelectValue placeholder={waiting ? waitingLabel : "Pick who owns it"} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectLabel>In this meeting</SelectLabel>
          {inMeeting.map((person) => (
            <PersonItem key={person.id} person={person} />
          ))}
        </SelectGroup>
        {others.length > 0 && (
          <SelectGroup>
            <SelectLabel>Rest of the team</SelectLabel>
            {others.map((person) => (
              <PersonItem key={person.id} person={person} />
            ))}
          </SelectGroup>
        )}
        <SelectSeparator />
        <SelectItem value={NEW_PERSON} className="text-primary">
          <UserPlus aria-hidden className="text-primary" />
          New person…
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

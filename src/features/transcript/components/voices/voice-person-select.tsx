import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/common/person-avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatePersonDialog } from "@/features/people/components/form/create-person-dialog";
import { cn } from "@/lib/utils";
import type { Person, SpeakerLabel } from "@/types";
import { useNameSpeaker } from "../../transcript.queries";

// Ids are uuids, so this item can never be a person.
const NEW_PERSON = "new-person";

/**
 * Who a voice is, as a pick of anyone on the team (those who took part first) or a new person.
 * A pick renames every line of the voice; the toast can take a rename back.
 */
export function VoicePersonSelect({
  id,
  meetingId,
  speaker,
  people,
  personById,
  className,
}: {
  id: string;
  meetingId: string;
  speaker: SpeakerLabel;
  /** In the order to offer them. */
  people: Person[];
  personById: Map<string, Person>;
  className?: string;
}) {
  const name = useNameSpeaker();
  const [creating, setCreating] = useState(false);

  function assign(person: Person) {
    const previous = speaker.personId ? personById.get(speaker.personId) : undefined;
    if (previous?.id === person.id) return;
    name.mutate(
      { meetingId, label: speaker.label, personId: person.id },
      {
        onSuccess: () =>
          toast.success(`${speaker.label} is now ${person.name}`, {
            // Back to whom it was; a voice that had nobody can only be named again.
            action: previous && {
              label: "Undo",
              onClick: () =>
                name.mutate({ meetingId, label: speaker.label, personId: previous.id }),
            },
          }),
      },
    );
  }

  function pick(value: string) {
    if (value === NEW_PERSON) {
      setCreating(true);
      return;
    }
    const person = personById.get(value);
    if (person) assign(person);
  }

  return (
    <>
      <Select value={speaker.personId ?? ""} onValueChange={pick} disabled={name.isPending}>
        <SelectTrigger id={id} className={cn("w-full bg-card", className)}>
          <SelectValue placeholder={`Who is ${speaker.label}?`} />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {people.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                <PersonAvatar person={person} size="sm" tooltip={false} />
                {person.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value={NEW_PERSON}>
            <UserPlus aria-hidden />
            New person…
          </SelectItem>
        </SelectContent>
      </Select>
      <CreatePersonDialog open={creating} onOpenChange={setCreating} onCreated={assign} />
    </>
  );
}

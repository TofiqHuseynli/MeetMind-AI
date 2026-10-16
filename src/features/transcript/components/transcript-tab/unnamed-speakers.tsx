import { UserRoundSearch } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Meeting, Person } from "@/types";
import { useNameSpeaker, useSpeakers } from "../../transcript.queries";

/**
 * The voices the analysis could not place ("Person 1"), each with a pick of anyone on the team.
 * Choosing someone names every line of that voice. Nothing shows while all are named.
 */
export function UnnamedSpeakers({
  meeting,
  personById,
}: {
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  const speakers = useSpeakers(meeting.id);
  const name = useNameSpeaker();
  const unnamed = (speakers.data ?? []).filter((speaker) => speaker.personId === null);
  if (unnamed.length === 0) return null;

  // Anyone on the team may be the voice, those who took part first; the pick adds them.
  const took = new Set(meeting.participantIds);
  const people = [...personById.values()].sort(
    (a, b) => Number(took.has(b.id)) - Number(took.has(a.id)),
  );

  return (
    <Card className="gap-3 rounded-2xl border-primary/30 bg-primary/5 px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <UserRoundSearch aria-hidden className="size-4 text-primary" />
        Some voices are not named yet. Who are they?
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {unnamed.map((speaker) => {
          const id = `speaker-${speaker.label.replace(/\W+/g, "-")}`;
          return (
            <li key={speaker.label} className="flex items-center gap-3">
              <label htmlFor={id} className="w-24 shrink-0 text-[13px] text-muted-foreground">
                {speaker.label}
              </label>
              <Select
                disabled={name.isPending}
                onValueChange={(personId) =>
                  name.mutate({ meetingId: meeting.id, label: speaker.label, personId })
                }
              >
                <SelectTrigger id={id} className="w-full bg-card">
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
                </SelectContent>
              </Select>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

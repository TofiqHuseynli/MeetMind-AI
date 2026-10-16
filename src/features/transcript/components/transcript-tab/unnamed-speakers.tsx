import { UserRoundSearch } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Meeting, Person } from "@/types";
import { useSpeakers } from "../../transcript.queries";
import { voiceCandidates, voiceIdOf } from "../../utils/voices";
import { VoicePersonSelect } from "../voices/voice-person-select";

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
  const unnamed = (speakers.data ?? []).filter((speaker) => speaker.personId === null);
  if (unnamed.length === 0) return null;

  const people = voiceCandidates(personById, meeting.participantIds);

  return (
    <Card className="gap-3 rounded-2xl border-primary/30 bg-primary/5 px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        <UserRoundSearch aria-hidden className="size-4 text-primary" />
        Some voices are not named yet. Who are they?
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {unnamed.map((speaker) => {
          const id = `speaker-${voiceIdOf(speaker.label)}`;
          return (
            <li key={speaker.label} className="flex items-center gap-3">
              <label htmlFor={id} className="w-24 shrink-0 text-[13px] text-muted-foreground">
                {speaker.label}
              </label>
              <VoicePersonSelect
                id={id}
                meetingId={meeting.id}
                speaker={speaker}
                people={people}
                personById={personById}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

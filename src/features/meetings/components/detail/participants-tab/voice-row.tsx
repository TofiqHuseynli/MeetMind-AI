import {
  ShowInTranscriptLink,
} from "@/features/transcript/components/shared/show-in-transcript-link";
import {
  VoicePersonSelect,
} from "@/features/transcript/components/voices/voice-person-select";
import { voiceIdOf } from "@/features/transcript/utils/voices";
import { cn } from "@/lib/utils";
import type { Person, SpeakerLabel } from "@/types";
import { plural } from "@/utils/text";

/**
 * One voice: its label and lines, a couple of them to tell who it is (each a link to its moment
 * in the transcript), and who it is. A voice nobody is named for stands out.
 */
export function VoiceRow({
  meetingId,
  speaker,
  people,
  personById,
}: {
  meetingId: string;
  speaker: SpeakerLabel;
  people: Person[];
  personById: Map<string, Person>;
}) {
  const id = `voice-${voiceIdOf(speaker.label)}`;
  const unnamed = speaker.personId === null;

  return (
    <li
      className={cn(
        "grid gap-3 rounded-2xl border p-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-start",
        unnamed && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="grid min-w-0 gap-1.5">
        <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
          <span className="font-semibold text-foreground">{speaker.label}</span>
          <span className="text-xs text-subtle-foreground">
            {plural(speaker.lineCount, "line")}
            {unnamed && " · not named yet"}
          </span>
        </label>
        <ul className="grid gap-1">
          {speaker.samples.map((sample) => (
            <li key={sample.segmentId} className="flex min-w-0 items-start gap-2">
              <ShowInTranscriptLink
                meetingId={meetingId}
                segmentId={sample.segmentId}
                atSec={sample.startSec}
                className="mt-0.5 shrink-0"
              />
              <q className="line-clamp-2 text-[13px] text-muted-foreground">{sample.text}</q>
            </li>
          ))}
        </ul>
      </div>
      <VoicePersonSelect
        id={id}
        meetingId={meetingId}
        speaker={speaker}
        people={people}
        personById={personById}
      />
    </li>
  );
}

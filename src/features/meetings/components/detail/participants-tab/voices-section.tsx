import { AudioLines } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpeakers } from "@/features/transcript/transcript.queries";
import { voiceCandidates } from "@/features/transcript/utils/voices";
import type { Meeting, Person } from "@/types";
import { SectionCard } from "../section/section-card";
import { VoiceRow } from "./voice-row";

/**
 * The voices in the recording and who each is. Naming or renaming one changes every line of it,
 * moves its tasks and counts the talk shares again.
 */
export function VoicesSection({
  meeting,
  personById,
}: {
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  const speakers = useSpeakers(meeting.id);
  const people = voiceCandidates(personById, meeting.participantIds);

  function renderBody() {
    if (speakers.isPending) return <Skeleton className="h-28 rounded-2xl" />;
    if (speakers.isError) {
      return (
        <ErrorState
          title="Couldn't load the voices"
          message={speakers.error.message}
          onRetry={() => speakers.refetch()}
        />
      );
    }
    if (speakers.data.length === 0) {
      return (
        <EmptyState
          icon={AudioLines}
          title="No voices"
          description="The transcript names no speakers."
        />
      );
    }
    return (
      <ul className="grid gap-3">
        {speakers.data.map((speaker) => (
          <VoiceRow
            key={speaker.label}
            meetingId={meeting.id}
            speaker={speaker}
            people={people}
            personById={personById}
          />
        ))}
      </ul>
    );
  }

  return (
    <SectionCard title="Voices" count={speakers.data?.length}>
      <p className="-mt-1 text-[13px] text-muted-foreground">
        Who each voice in the recording is. A change renames every line of it and moves its tasks.
      </p>
      {renderBody()}
    </SectionCard>
  );
}

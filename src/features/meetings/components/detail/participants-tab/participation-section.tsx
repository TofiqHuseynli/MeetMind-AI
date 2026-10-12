import { useMemo } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import type { Meeting, Person } from "@/types";
import { SectionCard } from "../section/section-card";
import { ParticipationBars, type ParticipationRow } from "./participation-bars";

/**
 * Who took part and how much each of them spoke, in the service's order (the most talkative
 * first), then anyone who stayed silent.
 */
export function ParticipationSection({
  meeting,
  personById,
}: {
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  const rows = useMemo<ParticipationRow[]>(() => {
    const spoke = meeting.participation.flatMap((row) => {
      const person = personById.get(row.personId);
      return person ? [{ ...row, person }] : [];
    });
    const silent = meeting.participantIds
      .filter((id) => !meeting.participation.some((row) => row.personId === id))
      .flatMap((id) => {
        const person = personById.get(id);
        return person ? [{ person, talkSharePct: 0, segmentCount: 0 }] : [];
      });
    return [...spoke, ...silent];
  }, [meeting, personById]);

  return (
    <SectionCard title="Participation" count={rows.length}>
      <p className="-mt-1 text-[13px] text-muted-foreground">
        Each person&apos;s share of the talking time and how often they spoke.
      </p>
      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No participants" description="Nobody was recorded." />
      ) : (
        <ParticipationBars rows={rows} />
      )}
    </SectionCard>
  );
}

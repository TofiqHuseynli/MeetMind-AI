import { Check } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import type { Person } from "@/types";
import { useDecisions } from "../../../meetings.queries";
import { DecisionRow } from "../decisions-tab/decision-row";
import { RowsSkeleton } from "../section/rows-skeleton";
import { SectionCard } from "../section/section-card";
import { TabLink } from "../section/tab-link";

const PREVIEW_SIZE = 3;

/**
 * The first few decisions of the meeting, each with who said it and a link to that moment, and
 * a link to the Decisions tab for the rest.
 */
export function KeyDecisions({
  meetingId,
  personById,
}: {
  meetingId: string;
  personById: Map<string, Person>;
}) {
  const decisions = useDecisions(meetingId);
  const all = decisions.data ?? [];
  const shown = all.slice(0, PREVIEW_SIZE);
  const hidden = all.length - shown.length;

  function renderContent() {
    if (decisions.isPending) return <RowsSkeleton />;
    if (!decisions.data) {
      return (
        <ErrorState
          title="Couldn't load the decisions"
          message={decisions.error?.message}
          onRetry={() => decisions.refetch()}
        />
      );
    }
    if (all.length === 0) {
      return (
        <EmptyState
          icon={Check}
          title="No decisions recorded"
          description="The analysis found no decision in this meeting."
        />
      );
    }
    return (
      <ul className="divide-y divide-border">
        {shown.map((decision) => (
          <DecisionRow
            key={decision.id}
            decision={decision}
            speaker={decision.sentence ? personById.get(decision.sentence.speakerId) : undefined}
          />
        ))}
      </ul>
    );
  }

  return (
    <SectionCard
      title="Key decisions"
      count={decisions.data?.length}
      action={hidden > 0 && <TabLink tab="decisions">All {all.length}</TabLink>}
    >
      {renderContent()}
    </SectionCard>
  );
}

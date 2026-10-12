import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { RowActions } from "@/components/data-table/row-actions";
import { Button } from "@/components/ui/button";
import type { Decision, Meeting, Person } from "@/types";
import { useDecisions } from "../../../meetings.queries";
import { CreateDecisionDialog } from "../../decision-form/create-decision-dialog";
import { DeleteDecisionDialog } from "../../decision-form/delete-decision-dialog";
import { EditDecisionDialog } from "../../decision-form/edit-decision-dialog";
import { RowsSkeleton } from "../section/rows-skeleton";
import { SectionCard } from "../section/section-card";
import { DecisionRow } from "./decision-row";

/**
 * The Decisions tab: what the meeting settled, in the order it was said, each with who said it
 * and a link to that moment; the ones added by hand come last. "Add decision" writes a new one,
 * and each can be reworded or deleted.
 */
export function DecisionsTab({
  meeting,
  personById,
}: {
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  const decisions = useDecisions(meeting.id);
  const items = decisions.data;

  // The dialogs keep their last content while they close, so the data and the open flag are
  // held apart.
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<Decision>();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<Decision>();

  function edit(decision: Decision) {
    setEdited(decision);
    setEditing(true);
  }

  function askToDelete(decision: Decision) {
    setDeleted(decision);
    setDeleting(true);
  }

  function addButton(size: "sm" | "default") {
    return (
      <Button size={size} onClick={() => setAdding(true)}>
        <Plus aria-hidden />
        Add decision
      </Button>
    );
  }

  function renderContent() {
    if (decisions.isPending) return <RowsSkeleton />;
    if (!items) {
      return (
        <ErrorState
          title="Couldn't load the decisions"
          message={decisions.error?.message}
          onRetry={() => decisions.refetch()}
        />
      );
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon={Check}
          title="No decisions yet"
          description="The analysis found no agreement here. If the team settled something, add it."
          action={addButton("default")}
        />
      );
    }
    return (
      <ul className="divide-y divide-border">
        {items.map((decision) => (
          <DecisionRow
            key={decision.id}
            decision={decision}
            speaker={decision.sentence ? personById.get(decision.sentence.speakerId) : undefined}
            actions={
              <RowActions
                layout="menu"
                label={`Actions for the decision: ${decision.text}`}
                actions={[
                  { label: "Edit decision", icon: Pencil, onClick: () => edit(decision) },
                  {
                    label: "Delete decision",
                    icon: Trash2,
                    onClick: () => askToDelete(decision),
                    destructive: true,
                  },
                ]}
              />
            }
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <SectionCard
        title="Decisions"
        count={items?.length}
        action={items && items.length > 0 && addButton("sm")}
        className="max-w-3xl"
      >
        {renderContent()}
      </SectionCard>
      <CreateDecisionDialog open={adding} onOpenChange={setAdding} meetingId={meeting.id} />
      {edited && (
        <EditDecisionDialog open={editing} onOpenChange={setEditing} decision={edited} />
      )}
      {deleted && (
        <DeleteDecisionDialog decision={deleted} open={deleting} onOpenChange={setDeleting} />
      )}
    </>
  );
}

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ACTION_ITEM_TITLE_MAX } from "@/features/action-items/action-items.schema";
import {
  CreateTaskDialog,
  type TaskDraft,
} from "@/features/action-items/components/task-form/create-task-dialog";
import { dueDay } from "@/features/action-items/utils/due-date";
import {
  CreateDecisionDialog,
} from "@/features/meetings/components/decision-form/create-decision-dialog";
import { DECISION_TEXT_MAX } from "@/features/meetings/meetings.schema";
import type { Meeting, Person, SuggestedTask, TranscriptSegment } from "@/types";
import { useLoadedTranscriptLinks } from "../../transcript.queries";
import { draftFromSentence, firstName, formatTimestamp } from "../../utils/format";
import { linksBySegment, segmentLinks } from "../../utils/links";
import { DeleteLinkedItemDialog, type DeleteTarget } from "./delete-linked-item-dialog";
import { EditLinkedItemDialog, type EditTarget } from "./edit-linked-item-dialog";
import { LinkedItems } from "./linked-items";

/**
 * The selected sentence as a quote, what it led to, and what can be made from it: a suggested
 * task in one click, "Create task" filled in from the sentence (where AI can write it), or
 * "Add decision" when the team agreed on something there. Tasks and decisions tied to it can be
 * edited or deleted.
 */
export function SegmentDetailsBody({
  segment,
  speaker,
  meeting,
  personById,
}: {
  segment: TranscriptSegment;
  speaker?: Person;
  meeting: Meeting;
  personById: Map<string, Person>;
}) {
  // The meeting's links are already loaded for the labels on the lines; this reads the part
  // of this sentence from the same cache, so no request goes out on a pick.
  const links = useLoadedTranscriptLinks(meeting.id);
  const ownLinks = useMemo(
    () => (links.data ? segmentLinks(linksBySegment(links.data), segment.id) : undefined),
    [links.data, segment.id],
  );
  // The dialogs keep their last content while they close, so the data and the open flag are
  // held apart.
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>({ defaults: {} });
  const [addingDecision, setAddingDecision] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<EditTarget>();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<DeleteTarget>();

  const people = meeting.participantIds.flatMap((id) => personById.get(id) ?? []);
  const said = `at ${formatTimestamp(segment.startSec)}`;
  const source = speaker
    ? `From what ${firstName(speaker.name)} said ${said}.`
    : `From what was said ${said}.`;
  const hasSuggestion = (ownLinks?.suggestedTasks.length ?? 0) > 0;

  function openCreate(next: TaskDraft) {
    setDraft(next);
    setCreating(true);
  }

  function createFromSentence() {
    openCreate({
      defaults: {
        title: draftFromSentence(segment.text, ACTION_ITEM_TITLE_MAX),
        ownerId: speaker?.id,
      },
    });
  }

  function editSuggestion(suggestion: SuggestedTask) {
    openCreate({
      suggestionId: suggestion.id,
      defaults: {
        title: suggestion.title,
        ownerId: suggestion.ownerId,
        dueDate: dueDay(suggestion.dueDate),
        priority: suggestion.priority,
      },
    });
  }

  function askToEdit(target: EditTarget) {
    setEdited(target);
    setEditing(true);
  }

  function askToDelete(target: DeleteTarget) {
    setDeleted(target);
    setDeleting(true);
  }

  function renderLinked() {
    if (links.isPending) {
      return (
        <div aria-busy className="grid gap-2.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      );
    }
    if (!ownLinks) {
      return (
        <ErrorState
          title="Couldn't load what this sentence led to"
          message={links.error?.message}
          onRetry={() => links.refetch()}
        />
      );
    }
    return (
      <LinkedItems
        links={ownLinks}
        personById={personById}
        onEditTask={(item) => askToEdit({ kind: "task", item })}
        onDeleteTask={(item) => askToDelete({ kind: "task", item })}
        onEditDecision={(decision) => askToEdit({ kind: "decision", decision })}
        onDeleteDecision={(decision) => askToDelete({ kind: "decision", decision })}
        onEditSuggestion={editSuggestion}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <blockquote className="rounded-xl bg-muted px-3.5 py-3 text-[13px] leading-6 text-foreground">
        {segment.text}
      </blockquote>
      {renderLinked()}
      <div className="grid gap-2">
        {/* With a suggestion on screen, its button is the main action and this one steps back. */}
        <Button variant={hasSuggestion ? "outline" : "default"} onClick={createFromSentence}>
          <Plus aria-hidden />
          {hasSuggestion ? "Create a different task" : "Create task"}
        </Button>
        <Button variant="outline" onClick={() => setAddingDecision(true)}>
          <Check aria-hidden />
          Add decision
        </Button>
      </div>
      <CreateTaskDialog
        open={creating}
        onOpenChange={setCreating}
        source={source}
        meetingId={meeting.id}
        segmentId={segment.id}
        draft={draft}
        people={people}
      />
      <CreateDecisionDialog
        open={addingDecision}
        onOpenChange={setAddingDecision}
        source={source}
        meetingId={meeting.id}
        segmentId={segment.id}
        text={draftFromSentence(segment.text, DECISION_TEXT_MAX)}
      />
      {deleted && (
        <DeleteLinkedItemDialog target={deleted} open={deleting} onOpenChange={setDeleting} />
      )}
      {edited && (
        <EditLinkedItemDialog
          target={edited}
          people={people}
          open={editing}
          onOpenChange={setEditing}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useMeeting } from "@/features/meetings/meetings.queries";
import { indexById } from "@/utils/array";
import type { ActionItemPlacement, ActionStatus, Person } from "@/types";
import { actionStatusLabel } from "../../action-items.constants";
import { useCreateActionItem, useDraftActionItem } from "../../action-items.queries";
import type { TaskFields } from "../../action-items.schema";
import { defaultDueDate } from "../../utils/due-date";
import { MeetingSelect } from "./meeting-select";
import { TaskForm } from "./task-form";

/** Where a new task comes from and what it starts with. */
export type TaskDraft = {
  defaults: Partial<TaskFields>;
  /** Set when the draft is a suggested task, which the service then takes out. */
  suggestionId?: string;
};

const meetingFieldId = "action-item-meeting";
const meetingErrorId = `${meetingFieldId}-error`;
const noPeople: Person[] = [];

/**
 * A new task, blank or opened from what it came from (a sentence of the transcript, or a task
 * suggested for it) and filled in from it. On a meeting's page it joins that meeting; elsewhere
 * (`meetingId` left out) the dialog asks for the meeting first and the owner comes from its
 * participants. A task added on the board gets that column's `status` and `placement`. The form
 * mounts on every open.
 */
export function CreateTaskDialog({
  open,
  onOpenChange,
  source,
  meetingId,
  segmentId,
  draft,
  people,
  status,
  placement,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the task comes from, in a sentence: "From what Amira said at 12:40." */
  source?: string;
  meetingId?: string;
  segmentId?: string;
  draft: TaskDraft;
  /** Who can own it: the meeting's participants, or without `meetingId` everyone. */
  people: Person[];
  status?: ActionStatus;
  placement?: ActionItemPlacement;
}) {
  const create = useCreateActionItem();
  const draftTask = useDraftActionItem();

  // A new open starts without a meeting picked.
  const [pickedId, setPickedId] = useState<string>();
  const [meetingMissing, setMeetingMissing] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPickedId(undefined);
      setMeetingMissing(false);
    }
  }

  const picking = meetingId === undefined;
  const picked = useMeeting(picking ? pickedId : undefined);
  const personById = useMemo(() => indexById(people), [people]);
  const pickedPeople = picked.data?.participantIds;
  const owners = useMemo(() => {
    if (!picking) return people;
    return pickedPeople?.flatMap((id) => personById.get(id) ?? []) ?? noPeople;
  }, [picking, people, pickedPeople, personById]);

  function ownerPlaceholder() {
    if (!pickedId) return "Pick the meeting first";
    if (picked.isError) return "Couldn't load the meeting's people";
    return "Loading the meeting's people…";
  }

  const targetId = meetingId ?? pickedId;
  const checkMeeting = () => setMeetingMissing(!targetId);

  function save(values: TaskFields) {
    if (!targetId) {
      setMeetingMissing(true);
      return;
    }
    create.mutate(
      {
        ...values,
        meetingId: targetId,
        segmentId,
        suggestionId: draft.suggestionId,
        status,
        placement,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const description = [
    source,
    picking
      ? "It joins the action items of the meeting you pick."
      : "It joins this meeting's action items.",
    status && status !== "todo" ? `It starts as ${actionStatusLabel[status]}.` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const meetingField = picking && (
    <Field data-invalid={meetingMissing}>
      <FieldLabel htmlFor={meetingFieldId}>Meeting</FieldLabel>
      <MeetingSelect
        id={meetingFieldId}
        value={pickedId}
        onChange={(id) => {
          setPickedId(id);
          setMeetingMissing(false);
        }}
        invalid={meetingMissing}
        describedBy={meetingMissing ? meetingErrorId : undefined}
      />
      <FieldError
        id={meetingErrorId}
        errors={meetingMissing ? [{ message: "Pick the meeting the task came from." }] : []}
      />
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TaskForm
          defaultValues={{
            title: draft.defaults.title ?? "",
            ownerId: draft.defaults.ownerId ?? "",
            dueDate: draft.defaults.dueDate ?? defaultDueDate(),
            priority: draft.defaults.priority ?? "medium",
          }}
          people={owners}
          ownerPlaceholder={picking ? ownerPlaceholder() : undefined}
          before={meetingField}
          submitLabel="Create task"
          saving={create.isPending}
          onSubmit={save}
          onInvalid={checkMeeting}
          onDraft={segmentId ? () => draftTask.mutateAsync({ segmentId }) : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}

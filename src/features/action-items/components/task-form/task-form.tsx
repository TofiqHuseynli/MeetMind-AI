import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeople } from "@/features/meetings/meetings.queries";
import { CreatePersonDialog } from "@/features/people/components/form/create-person-dialog";
import { cn } from "@/lib/utils";
import { PRIORITIES, type Person } from "@/types";
import { taskFieldsSchema, type TaskFields } from "../../action-items.schema";
import { priorityLabel } from "../../action-items.constants";
import { ownerGroups } from "../../utils/owners";
import { OwnerSelect } from "./owner-select";

const priorityDot = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
} as const;

// Ids follow <feature>-<field>; each error is tied to its control through aria-describedby.
const ids = {
  title: "action-item-title",
  owner: "action-item-owner",
  dueDate: "action-item-due-date",
  priority: "action-item-priority",
};

function errorId(id: string) {
  return `${id}-error`;
}

const noPeople: Person[] = [];

/**
 * A task's fields inside a dialog: what to do, who owns it, by when and how urgent. The dialog
 * around it decides what saving means (a new task or a change) and owns the mutation. With
 * `onDraft`, "Write with AI" fills every field from the sentence the task comes from. `before`
 * holds fields the dialog owns itself (the meeting, when it is picked here); `onInvalid` tells
 * it a save was tried, so it can check them along with the rest.
 */
export function TaskForm({
  defaultValues,
  people,
  ownerPlaceholder = "Pick who owns it",
  before,
  submitLabel,
  saving,
  onSubmit,
  onInvalid,
  onDraft,
}: {
  defaultValues: TaskFields;
  /** Who can own the task: the meeting's participants. */
  people: Person[];
  /** Why there is no one to pick yet, while `people` is empty. */
  ownerPlaceholder?: string;
  before?: React.ReactNode;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: TaskFields) => void;
  onInvalid?: () => void;
  /** Asks the analysis for the fields; it shows its own error toast. */
  onDraft?: () => Promise<TaskFields>;
}) {
  const form = useForm<TaskFields>({
    resolver: zodResolver(taskFieldsSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const [drafting, setDrafting] = useState(false);
  const [drafted, setDrafted] = useState(false);
  const [addingPerson, setAddingPerson] = useState(false);
  const everyone = usePeople();
  const owners = useMemo(
    () => ownerGroups(people, everyone.data ?? noPeople),
    [people, everyone.data],
  );

  async function draft() {
    if (!onDraft) return;
    setDrafting(true);
    try {
      form.reset(await onDraft(), { keepDefaultValues: true });
      setDrafted(true);
    } catch {
      // The draft hook already showed what went wrong; the fields stay as they were.
    } finally {
      setDrafting(false);
    }
  }

  const isOwner = (id: string) =>
    owners.inMeeting.some((person) => person.id === id) ||
    owners.others.some((person) => person.id === id);

  // The owner must be on the team; the list changes when the dialog's meeting does.
  function submit(values: TaskFields) {
    if (!isOwner(values.ownerId)) {
      form.setError("ownerId", { message: "Pick who owns the task." });
      onInvalid?.();
      return;
    }
    onSubmit(values);
  }

  // The person dialog sits outside the form: React events bubble through portals, and its
  // submit would otherwise submit the task too.
  return (
    <>
      <form noValidate onSubmit={form.handleSubmit(submit, onInvalid)} className="grid gap-6">
        <FieldGroup>
          {before}
          <Field data-invalid={Boolean(errors.title)}>
            <div className="flex items-center justify-between gap-2">
              <FieldLabel htmlFor={ids.title}>Task</FieldLabel>
              {onDraft && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={drafting || saving}
                  onClick={draft}
                  className="-my-1 text-primary hover:text-primary-hover"
                >
                  {drafting ? (
                    <LoaderCircle aria-hidden className="animate-spin" />
                  ) : (
                    <Sparkles aria-hidden />
                  )}
                  {drafting ? "Writing…" : "Write with AI"}
                </Button>
              )}
            </div>
            <Input
              id={ids.title}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? errorId(ids.title) : undefined}
              {...form.register("title")}
            />
            {drafted && (
              <FieldDescription>
                Written by AI from the sentence. Check every field before you save.
              </FieldDescription>
            )}
            <FieldError id={errorId(ids.title)} errors={[errors.title]} />
          </Field>

          <Field data-invalid={Boolean(errors.ownerId)}>
            <FieldLabel htmlFor={ids.owner}>Owner</FieldLabel>
            <Controller
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <OwnerSelect
                  id={ids.owner}
                  value={isOwner(field.value) ? field.value : ""}
                  onChange={field.onChange}
                  inMeeting={owners.inMeeting}
                  others={owners.others}
                  waitingLabel={ownerPlaceholder}
                  invalid={Boolean(errors.ownerId)}
                  describedBy={errors.ownerId ? errorId(ids.owner) : undefined}
                  onNewPerson={() => setAddingPerson(true)}
                />
              )}
            />
            <FieldError id={errorId(ids.owner)} errors={[errors.ownerId]} />
          </Field>

          <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
            <Field data-invalid={Boolean(errors.dueDate)}>
              <FieldLabel htmlFor={ids.dueDate}>Deadline</FieldLabel>
              <Controller
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    id={ids.dueDate}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.dueDate)}
                    describedBy={errors.dueDate ? errorId(ids.dueDate) : undefined}
                  />
                )}
              />
              <FieldError id={errorId(ids.dueDate)} errors={[errors.dueDate]} />
            </Field>

            <Field>
              <FieldLabel htmlFor={ids.priority}>Priority</FieldLabel>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={ids.priority} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <span
                              aria-hidden
                              className={cn("size-2 rounded-full", priorityDot[priority])}
                            />
                            {priorityLabel[priority]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={saving || drafting}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </form>
      <CreatePersonDialog
        open={addingPerson}
        onOpenChange={setAddingPerson}
        onCreated={(person) => form.setValue("ownerId", person.id, { shouldValidate: true })}
      />
    </>
  );
}

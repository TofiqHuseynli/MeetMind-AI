import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { decisionFieldsSchema, type DecisionFields } from "../../meetings.schema";

// Ids follow <feature>-<field>; the hint and the error are tied to the field.
const TEXT_ID = "decision-text";
const HINT_ID = `${TEXT_ID}-hint`;
const ERROR_ID = `${TEXT_ID}-error`;

/**
 * A decision's wording inside a dialog. The dialog around it decides what saving means (a new
 * decision or a change) and owns the mutation.
 */
export function DecisionForm({
  defaultValues,
  submitLabel,
  saving,
  onSubmit,
}: {
  defaultValues: DecisionFields;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: DecisionFields) => void;
}) {
  const form = useForm<DecisionFields>({
    resolver: zodResolver(decisionFieldsSchema),
    defaultValues,
  });
  const error = form.formState.errors.text;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={TEXT_ID}>Decision</FieldLabel>
          <Textarea
            id={TEXT_ID}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${HINT_ID} ${ERROR_ID}` : HINT_ID}
            className="max-h-48 min-h-20"
            {...form.register("text")}
          />
          <FieldDescription id={HINT_ID}>
            One sentence, worded the way the team agreed on it.
          </FieldDescription>
          <FieldError id={ERROR_ID} errors={[error]} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

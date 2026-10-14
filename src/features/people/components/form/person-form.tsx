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
import { Input } from "@/components/ui/input";
import { personFieldsSchema, type PersonFieldsInput } from "../../people.schema";

// Ids follow <feature>-<field>; each error is tied to its control through aria-describedby.
const ids = { name: "person-name", role: "person-role", email: "person-email" };

function errorId(id: string) {
  return `${id}-error`;
}

/** A person's name, role and email inside a dialog. The dialog owns the mutation. */
export function PersonForm({
  defaultValues,
  submitLabel,
  saving,
  onSubmit,
}: {
  defaultValues: PersonFieldsInput;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: PersonFieldsInput) => void;
}) {
  const form = useForm<PersonFieldsInput>({
    resolver: zodResolver(personFieldsSchema),
    defaultValues,
  });
  const { errors } = form.formState;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={ids.name}>Name</FieldLabel>
          <Input
            id={ids.name}
            autoComplete="name"
            autoFocus
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errorId(ids.name) : undefined}
            {...form.register("name")}
          />
          <FieldError id={errorId(ids.name)} errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.role)}>
          <FieldLabel htmlFor={ids.role}>Role</FieldLabel>
          <Input
            id={ids.role}
            placeholder="Product Designer"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? errorId(ids.role) : undefined}
            {...form.register("role")}
          />
          <FieldError id={errorId(ids.role)} errors={[errors.role]} />
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={ids.email}>Email</FieldLabel>
          <Input
            id={ids.email}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId(ids.email) : `${ids.email}-hint`}
            {...form.register("email")}
          />
          <FieldDescription id={`${ids.email}-hint`}>
            Optional. With it they can be invited to sign in.
          </FieldDescription>
          <FieldError id={errorId(ids.email)} errors={[errors.email]} />
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

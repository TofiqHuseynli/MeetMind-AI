import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSetPassword } from "../../auth.queries";
import { PASSWORD_MIN, setPasswordSchema, type SetPasswordInput } from "../../auth.schema";

const ids = { password: "auth-new-password", confirm: "auth-confirm-password" };

function errorId(id: string) {
  return `${id}-error`;
}

/** The new password twice, for the session an invitation or a reset link opened. */
export function SetPasswordForm({ onSaved }: { onSaved: () => void }) {
  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const { errors } = form.formState;
  const save = useSetPassword();

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => save.mutate(values, { onSuccess: onSaved }))}
      className="grid gap-6"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor={ids.password}>New password</FieldLabel>
          <Input
            id={ids.password}
            type="password"
            autoComplete="new-password"
            autoFocus
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? errorId(ids.password) : undefined}
            {...form.register("password")}
          />
          <FieldDescription>At least {PASSWORD_MIN} characters.</FieldDescription>
          <FieldError id={errorId(ids.password)} errors={[errors.password]} />
        </Field>
        <Field data-invalid={Boolean(errors.confirm)}>
          <FieldLabel htmlFor={ids.confirm}>Repeat it</FieldLabel>
          <Input
            id={ids.confirm}
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? errorId(ids.confirm) : undefined}
            {...form.register("confirm")}
          />
          <FieldError id={errorId(ids.confirm)} errors={[errors.confirm]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={save.isPending} className="w-full">
        {save.isPending ? "Saving…" : "Save and continue"}
      </Button>
    </form>
  );
}

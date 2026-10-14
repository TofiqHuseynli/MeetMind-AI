import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSendPasswordReset } from "../../auth.queries";
import { passwordResetSchema, type PasswordResetInput } from "../../auth.schema";

const emailId = "auth-reset-email";

/** Asks for the email that gets a link to set a new password. */
export function ResetRequestForm({
  defaultEmail,
  onBack,
}: {
  defaultEmail: string;
  onBack: () => void;
}) {
  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: defaultEmail },
  });
  const { errors } = form.formState;
  const send = useSendPasswordReset();

  if (send.isSuccess) {
    return (
      <div className="grid gap-4 text-sm">
        <p className="flex items-start gap-2 text-muted-foreground">
          <MailCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-status-done" />
          If an account has this email, a link to set a new password is on its way.
        </p>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => send.mutate(values))}
      className="grid gap-6"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={emailId}>Email</FieldLabel>
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            {...form.register("email")}
          />
          <FieldError id={`${emailId}-error`} errors={[errors.email]} />
        </Field>
      </FieldGroup>
      <div className="grid gap-2">
        <Button type="submit" disabled={send.isPending}>
          {send.isPending ? "Sending…" : "Send the link"}
        </Button>
        <Button type="button" variant="ghost" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    </form>
  );
}

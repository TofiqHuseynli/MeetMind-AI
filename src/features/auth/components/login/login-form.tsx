import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSignIn } from "../../auth.queries";
import { signInSchema, type SignInInput } from "../../auth.schema";

const ids = { email: "auth-email", password: "auth-password" };

function errorId(id: string) {
  return `${id}-error`;
}

/** Email and password. A signed-in session moves the page on by itself (the login view). */
export function LoginForm({ onForgot }: { onForgot: (email: string) => void }) {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;
  const signIn = useSignIn();

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
      className="grid gap-6"
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={ids.email}>Email</FieldLabel>
          <Input
            id={ids.email}
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId(ids.email) : undefined}
            {...form.register("email")}
          />
          <FieldError id={errorId(ids.email)} errors={[errors.email]} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor={ids.password}>Password</FieldLabel>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="-my-1 px-0 text-primary"
              onClick={() => onForgot(form.getValues("email"))}
            >
              Forgot password?
            </Button>
          </div>
          <Input
            id={ids.password}
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? errorId(ids.password) : undefined}
            {...form.register("password")}
          />
          <FieldError id={errorId(ids.password)} errors={[errors.password]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={signIn.isPending} className="w-full">
        {signIn.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

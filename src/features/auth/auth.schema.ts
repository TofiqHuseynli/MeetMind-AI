import { z } from "zod";

// What the sign-in pages send. Parsed in auth.api.ts before anything reaches Supabase.

export const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

const email = z.email("Enter your email address.").trim().max(254);

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(PASSWORD_MAX),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const passwordResetSchema = z.object({ email });

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(PASSWORD_MAX, `Keep it under ${PASSWORD_MAX} characters.`),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "The two passwords differ.",
  });

export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

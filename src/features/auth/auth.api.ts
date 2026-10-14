import * as db from "@/supabase/db/auth";
import type { Person } from "@/types";
import {
  passwordResetSchema,
  setPasswordSchema,
  signInSchema,
  type PasswordResetInput,
  type SetPasswordInput,
  type SignInInput,
} from "./auth.schema";

// The pages a password email opens: an invitation and a reset both land on /set-password.
const SET_PASSWORD_PATH = "/set-password";

export async function signIn(input: SignInInput): Promise<void> {
  const { email, password } = signInSchema.parse(input);
  return db.signIn(email, password);
}

export function signOut(): Promise<void> {
  return db.signOut();
}

export async function sendPasswordReset(input: PasswordResetInput): Promise<void> {
  const { email } = passwordResetSchema.parse(input);
  return db.sendPasswordReset(email, `${window.location.origin}${SET_PASSWORD_PATH}`);
}

export async function setPassword(input: SetPasswordInput): Promise<void> {
  const { password } = setPasswordSchema.parse(input);
  return db.setPassword(password);
}

export function fetchPersonOfUser(userId: string): Promise<Person | null> {
  return db.getPersonOfUser(userId);
}

import type { Person } from "@/types";
import { supabase } from "../client";
import { toPerson } from "../mappers/reference";

// Supabase answers a failed sign-in with an error object; these throw it, as every read does,
// so the mutation hooks show it.

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(signInMessage(error.message));
}

// "Invalid login credentials" says nothing about what to do next.
function signInMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return "The email or the password is wrong.";
  if (/email not confirmed/i.test(message)) return "Open the invitation email first.";
  return message;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase().auth.signOut();
  if (error) throw new Error(error.message);
}

/** Sends the email whose link opens `redirectTo` with a session, to set a new password. */
export async function sendPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

/** The signed-in user's new password: after an invitation, or a reset link. */
export async function setPassword(password: string): Promise<void> {
  const { error } = await supabase().auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

/** The person the signed-in user is, or null when no person has their email yet. */
export async function getPersonOfUser(userId: string): Promise<Person | null> {
  const { data, error } = await supabase()
    .from("people")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toPerson(data) : null;
}

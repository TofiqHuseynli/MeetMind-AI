import { supabase } from "@/supabase/client";

/**
 * Calls one of our functions in api/ with the signed-in user's session, which every function
 * checks. A failed call throws with the message the function sent.
 */
export async function callApi<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your session has ended. Sign in again.");

  const response = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const answer: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      answer && typeof answer === "object" && "error" in answer && typeof answer.error === "string"
        ? answer.error
        : `The server answered ${response.status}.`;
    throw new Error(message);
  }
  return answer as T;
}

/**
 * Starts the work on a processing meeting without waiting for it: api/process runs until the
 * meeting is ready or failed, and the meeting page polls for that. A start that never reaches
 * the server leaves the meeting processing; that is only logged.
 */
export function startProcessing(meetingId: string): void {
  callApi("process", { meetingId }).catch((error: unknown) => {
    console.warn(`Could not start processing ${meetingId}:`, error);
  });
}

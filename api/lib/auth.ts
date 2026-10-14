import type { User } from "@supabase/supabase-js";
import { HttpError } from "./http.js";
import { supabaseAdmin } from "./supabase-admin.js";

/**
 * The signed-in user who sent the request. The browser sends its Supabase access token as
 * `Authorization: Bearer <token>`; without a valid one the request stops here with a 401, so
 * uploads and AI credits are reachable only after sign-in.
 */
export async function requireUser(request: Request): Promise<User> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new HttpError(401, "Sign in first.");
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Your session has ended. Sign in again.");
  return data.user;
}

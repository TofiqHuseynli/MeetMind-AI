import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/supabase/database.types.js";

let client: SupabaseClient<Database> | null = null;

/**
 * Supabase with the secret key, for the functions in api/ only. It skips row level security,
 * so every function checks the caller's session first (auth.ts).
 */
export function supabaseAdmin(): SupabaseClient<Database> {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY for api/.");
  client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

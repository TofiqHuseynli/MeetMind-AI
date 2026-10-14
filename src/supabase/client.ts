import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * The one Supabase client of the app, made on first use: a missing env var then fails where
 * the data is read, with a message that says which, instead of at startup.
 */
export function supabase(): SupabaseClient<Database> {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not set up: add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  client = createClient<Database>(url, key);
  return client;
}

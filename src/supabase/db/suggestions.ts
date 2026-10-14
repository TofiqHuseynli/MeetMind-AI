import { supabase } from "../client";
import { check } from "./query";

/** Takes a suggested task out without making it, when nobody wants it. */
export async function dismissSuggestedTask(id: string): Promise<void> {
  check(await supabase().from("suggested_tasks").delete().eq("id", id));
}

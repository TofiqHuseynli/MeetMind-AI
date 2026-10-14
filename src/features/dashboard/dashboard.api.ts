import * as db from "@/supabase/db/dashboard";
import type { DashboardStatistics } from "@/types";

// The dashboard reads Supabase: the database counts everything in one reply.

/** This week against the last, meetings per day, the sentiment trend and the open items. */
export function fetchDashboardStatistics(): Promise<DashboardStatistics> {
  return db.getDashboardStatistics();
}

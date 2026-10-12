import * as db from "@/mock/db";
import type { DashboardStatistics } from "@/types";

// Today these read the mock db. A real service replaces the bodies, nothing else.

/** This week against the last, meetings per day, the sentiment trend and the open items. */
export function fetchDashboardStatistics(): Promise<DashboardStatistics> {
  return db.getDashboardStatistics();
}

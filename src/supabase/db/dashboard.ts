import type { DashboardStatistics } from "@/types";
import { toDayValue } from "@/utils/date";
import { supabase } from "../client";
import { toDashboardStatistics } from "../mappers/dashboard";
import { check } from "./query";

/**
 * The dashboard's numbers, counted by the database in one reply. It is told the reader's today
 * and time zone, so "this week" and "overdue" mean what they mean where the reader is.
 */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  const result = await supabase().rpc("dashboard_statistics", {
    p_today: toDayValue(new Date()),
    p_time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return toDashboardStatistics(check(result));
}

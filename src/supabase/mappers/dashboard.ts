import { z } from "zod";
import type { DashboardStatistics } from "@/types";
import type { Json } from "../database.types";

// dashboard_statistics answers with JSON; this checks it has the shape the dashboard reads.

const week = z.object({
  meetings: z.number(),
  minutes: z.number(),
  sentiment: z.number().nullable(),
  actionItemsCreated: z.number(),
});

const statistics = z.object({
  thisWeek: week,
  lastWeek: week,
  days: z.array(z.object({ date: z.string(), meetings: z.number() })),
  sentimentByWeek: z.array(
    z.object({ weekStart: z.string(), score: z.number().nullable(), meetings: z.number() }),
  ),
  openByPriority: z.object({ low: z.number(), medium: z.number(), high: z.number() }),
  overdue: z.number(),
}) satisfies z.ZodType<DashboardStatistics>;

export function toDashboardStatistics(value: Json): DashboardStatistics {
  return statistics.parse(value);
}

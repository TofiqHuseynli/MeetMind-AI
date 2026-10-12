import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { plural } from "@/utils/text";
import { useDashboardStatistics } from "../../dashboard.queries";
import { dayChartRows, meetingTotal, type DayChartRow } from "../../utils/chart-rows";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";
import { LegendItem } from "./legend-item";

const tick = { fill: "var(--color-muted-foreground)", fontSize: 12 };
const noDays: DayChartRow[] = [];

/** Meetings held on each of the last 28 days; the last seven in the accent. */
export function MeetingsPerDayChart({ className }: { className?: string }) {
  const statistics = useDashboardStatistics();
  const days = statistics.data?.days;
  const rows = useMemo(() => (days ? dayChartRows(days) : noDays), [days]);
  const total = days ? meetingTotal(days) : 0;
  const thisWeek = statistics.data?.thisWeek.meetings ?? 0;

  return (
    <ChartCard
      title="Meetings per day"
      description="The last four weeks, this week in the accent."
      className={className}
      isPending={statistics.isPending}
      error={statistics.data ? null : statistics.error}
      onRetry={() => statistics.refetch()}
      isEmpty={total === 0}
      emptyTitle="No meetings yet"
      emptyDescription="Nothing was held in the last four weeks."
      legend={
        <>
          <LegendItem swatch="bg-chart-1">This week</LegendItem>
          <LegendItem swatch="bg-chart-2">Earlier</LegendItem>
        </>
      }
    >
      <div
        role="img"
        aria-label={`${plural(total, "meeting")} in four weeks, ${thisWeek} of them this week.`}
        className="size-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tick={tick}
              tickLine={false}
              axisLine={false}
              interval={6}
              tickMargin={8}
            />
            <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              content={({ active, payload }) => {
                const row: DayChartRow | undefined = payload?.[0]?.payload;
                if (!active || !row) return null;
                return (
                  <ChartTooltip title={row.label}>
                    {plural(row.thisWeek + row.earlier, "meeting")}
                  </ChartTooltip>
                );
              }}
            />
            <Bar
              dataKey="earlier"
              stackId="day"
              fill="var(--color-chart-2)"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="thisWeek"
              stackId="day"
              fill="var(--color-chart-1)"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

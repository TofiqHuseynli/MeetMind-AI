import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatScore } from "@/utils/format";
import { plural } from "@/utils/text";
import { useDashboardStatistics } from "../../dashboard.queries";
import {
  hasSentiment,
  sentimentChartRows,
  sentimentSummary,
  type SentimentChartRow,
} from "../../utils/chart-rows";
import { ChartCard } from "./chart-card";
import { ChartTooltip } from "./chart-tooltip";

const tick = { fill: "var(--color-muted-foreground)", fontSize: 12 };
const noRows: SentimentChartRow[] = [];

/** The mean sentiment of each of the last four weeks, from -1 to 1 around a zero line. */
export function SentimentTrendChart({ className }: { className?: string }) {
  const statistics = useDashboardStatistics();
  const weeks = statistics.data?.sentimentByWeek;
  const rows = useMemo(() => (weeks ? sentimentChartRows(weeks) : noRows), [weeks]);

  return (
    <ChartCard
      title="Sentiment trend"
      description="The mean score of each week's meetings, from -1 to +1."
      className={className}
      isPending={statistics.isPending}
      error={statistics.data ? null : statistics.error}
      onRetry={() => statistics.refetch()}
      isEmpty={!weeks || !hasSentiment(weeks)}
      emptyTitle="No sentiment yet"
      emptyDescription="No meeting of the last four weeks is analysed."
    >
      <div
        role="img"
        aria-label={`Sentiment by week: ${sentimentSummary(rows)}.`}
        className="size-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tick={tick}
              tickLine={false}
              axisLine={false}
              domain={[-1, 1]}
              ticks={[-1, -0.5, 0, 0.5, 1]}
            />
            <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: "var(--color-border)" }}
              content={({ active, payload }) => {
                const row: SentimentChartRow | undefined = payload?.[0]?.payload;
                if (!active || !row) return null;
                return (
                  <ChartTooltip title={`Week of ${row.label}`}>
                    {row.score === null
                      ? "No analysed meeting"
                      : `${formatScore(row.score)} over ${plural(row.meetings, "meeting")}`}
                  </ChartTooltip>
                );
              }}
            />
            <Line
              dataKey="score"
              type="monotone"
              stroke="var(--color-chart-3)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--color-chart-3)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

import type { DayMeetings, WeekSentiment } from "@/types";
import { formatScore, formatShortDay } from "@/utils/format";

/** A bar of the meetings per day chart; one of the two counts is always 0. */
export type DayChartRow = {
  label: string;
  thisWeek: number;
  earlier: number;
};

export type SentimentChartRow = {
  label: string;
  score: number | null;
  meetings: number;
};

const THIS_WEEK_DAYS = 7;

/** The last seven days get the accent, so the days come as two series. */
export function dayChartRows(days: DayMeetings[]): DayChartRow[] {
  const firstOfThisWeek = days.length - THIS_WEEK_DAYS;
  return days.map((day, i) => ({
    label: formatShortDay(day.date),
    thisWeek: i >= firstOfThisWeek ? day.meetings : 0,
    earlier: i >= firstOfThisWeek ? 0 : day.meetings,
  }));
}

export function sentimentChartRows(weeks: WeekSentiment[]): SentimentChartRow[] {
  return weeks.map((week) => ({
    label: formatShortDay(week.weekStart),
    score: week.score === null ? null : Math.round(week.score * 100) / 100,
    meetings: week.meetings,
  }));
}

export function meetingTotal(days: DayMeetings[]): number {
  return days.reduce((sum, day) => sum + day.meetings, 0);
}

export function hasSentiment(weeks: WeekSentiment[]): boolean {
  return weeks.some((week) => week.score !== null);
}

/** The trend in words for a screen reader: "week of 15 Sep +0.30, week of 22 Sep none". */
export function sentimentSummary(rows: SentimentChartRow[]): string {
  return rows
    .map((row) => `week of ${row.label} ${row.score === null ? "none" : formatScore(row.score)}`)
    .join(", ");
}

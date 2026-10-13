import { differenceInCalendarDays, parseISO, startOfToday, subDays } from "date-fns";
import type {
  DashboardStatistics,
  DayMeetings,
  Meeting,
  Priority,
  WeekSentiment,
  WeekSummary,
} from "@/types";
import { delay } from "@/mock/delay";
import { dueDayOf, toDayValue } from "@/utils/date";
import { copy, db } from "./store";

const WEEK_DAYS = 7;
const TREND_WEEKS = 4;

/** Whole days from the date back to today: 0 is today, 1 yesterday. Future dates are below 0. */
function daysAgo(iso: string, today: Date): number {
  return differenceInCalendarDays(today, parseISO(iso));
}

/** Week 0 is the last seven days, week 1 the seven before them. */
function weekIndex(iso: string, today: Date): number {
  return Math.floor(daysAgo(iso, today) / WEEK_DAYS);
}

function meanSentiment(meetings: Meeting[]): number | null {
  const scores = meetings.flatMap((m) => (m.sentiment ? [m.sentiment.score] : []));
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function summarizeWeek(week: number, meetings: Meeting[], today: Date): WeekSummary {
  const inWeek = meetings.filter((m) => weekIndex(m.date, today) === week);
  const created = [...db().actionItems.values()].filter(
    (a) => weekIndex(a.createdAt, today) === week,
  );
  return {
    meetings: inWeek.length,
    minutes: inWeek.reduce((sum, m) => sum + m.durationMin, 0),
    sentiment: meanSentiment(inWeek),
    actionItemsCreated: created.length,
  };
}

function meetingsPerDay(meetings: Meeting[], today: Date): DayMeetings[] {
  const dayCount = WEEK_DAYS * TREND_WEEKS;
  return Array.from({ length: dayCount }, (_, i) => {
    const ago = dayCount - 1 - i;
    return {
      date: subDays(today, ago).toISOString(),
      meetings: meetings.filter((m) => daysAgo(m.date, today) === ago).length,
    };
  });
}

function sentimentByWeek(meetings: Meeting[], today: Date): WeekSentiment[] {
  return Array.from({ length: TREND_WEEKS }, (_, i) => {
    const week = TREND_WEEKS - 1 - i;
    const inWeek = meetings.filter(
      (m) => m.status === "ready" && weekIndex(m.date, today) === week,
    );
    return {
      weekStart: subDays(today, week * WEEK_DAYS + WEEK_DAYS - 1).toISOString(),
      score: meanSentiment(inWeek),
      meetings: inWeek.length,
    };
  });
}

/** The dashboard's numbers, counted over every meeting and action item, as the service will. */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  await delay();
  const today = startOfToday();
  const meetings = [...db().meetings.values()];
  const openByPriority: Record<Priority, number> = { low: 0, medium: 0, high: 0 };
  let overdue = 0;
  for (const item of db().actionItems.values()) {
    if (item.status === "done") continue;
    openByPriority[item.priority] += 1;
    if (dueDayOf(item.dueDate) < toDayValue(today)) overdue += 1;
  }
  return copy({
    thisWeek: summarizeWeek(0, meetings, today),
    lastWeek: summarizeWeek(1, meetings, today),
    days: meetingsPerDay(meetings, today),
    sentimentByWeek: sentimentByWeek(meetings, today),
    openByPriority,
    overdue,
  });
}

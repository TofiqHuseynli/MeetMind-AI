import type { Priority } from "./action-item";

/** One stretch of days in numbers: the last seven days, or the seven before them. */
export type WeekSummary = {
  meetings: number;
  minutes: number;
  /** The mean score of its analysed meetings; null when none is analysed. */
  sentiment: number | null;
  actionItemsCreated: number;
};

/** How many meetings were held on one day. `date` is the day's start. */
export type DayMeetings = {
  date: string;
  meetings: number;
};

/** One week of the sentiment trend; `score` is null when no meeting of it was analysed. */
export type WeekSentiment = {
  weekStart: string;
  score: number | null;
  meetings: number;
};

/**
 * What the dashboard shows, counted by the service. A week is seven days ending today, so
 * "this week" never starts empty on a Monday.
 */
export type DashboardStatistics = {
  thisWeek: WeekSummary;
  lastWeek: WeekSummary;
  /** The last 28 days, oldest first, today last. */
  days: DayMeetings[];
  /** The last four weeks, oldest first. */
  sentimentByWeek: WeekSentiment[];
  openByPriority: Record<Priority, number>;
  /** Open items past their due day, across every priority. */
  overdue: number;
};

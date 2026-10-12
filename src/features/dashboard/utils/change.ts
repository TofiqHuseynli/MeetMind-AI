/** Which way a number moved since last week. */
export type Trend = "up" | "down" | "same";

export type WeekChange = {
  trend: Trend;
  /** "+2", "-30 min", "+0.15": the difference with its sign. */
  text: string;
};

function trendOf(delta: number): Trend {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "same";
}

/** The change in a count, written by `format` with its sign. */
export function countChange(
  current: number,
  previous: number,
  format: (value: number) => string = String,
): WeekChange {
  const delta = current - previous;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "±";
  return { trend: trendOf(delta), text: `${sign}${format(Math.abs(delta))}` };
}

/**
 * The change in a sentiment score, or null when a week has no analysed meeting. Moves under
 * 0.01 count as none, so rounding never shows "+0.00".
 */
export function scoreChange(current: number | null, previous: number | null): WeekChange | null {
  if (current === null || previous === null) return null;
  const delta = Math.round((current - previous) * 100) / 100;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "±";
  return { trend: trendOf(delta), text: `${sign}${Math.abs(delta).toFixed(2)}` };
}

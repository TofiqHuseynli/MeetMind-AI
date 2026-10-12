/** Meeting time as hours for a large number: "3.5 h", "12 h", "45 min" under an hour. */
export function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} h`;
}

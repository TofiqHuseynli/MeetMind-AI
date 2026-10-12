/** Seconds from the start as mm:ss, or h:mm:ss past the first hour. */
export function formatTimestamp(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const seconds = String(Math.floor(totalSec % 60)).padStart(2, "0");
  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

/** A stretch of time as the transcript shows it: "04:12–09:30". */
export function formatSpan(fromSec: number, toSec: number): string {
  return `${formatTimestamp(fromSec)}–${formatTimestamp(toSec)}`;
}

export function firstName(name: string): string {
  return name.split(" ")[0];
}

/**
 * A first draft of a task title or a decision from what was said: the whole text, cut at a word
 * if long.
 */
export function draftFromSentence(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max - 1);
  return `${text.slice(0, cut > 0 ? cut : max - 1)}…`;
}

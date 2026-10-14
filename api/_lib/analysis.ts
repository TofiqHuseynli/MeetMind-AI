import { z } from "zod";
import type { JsonSchema } from "./llm/types.js";

// What the model is asked for and how its answer is checked. The transcript goes as numbered
// lines; the answer points at lines by number, and only numbers that exist are kept.

export type Participant = { id: string; name: string; role: string };
export type Line = { speaker: string; text: string };

const SENTIMENTS = ["positive", "neutral", "negative"] as const;
const LEVELS = ["low", "medium", "high"] as const;

const text = (max: number) => z.string().trim().min(1).max(max);
const lineNumber = z.number().int();
// Any text: a day the model writes wrong becomes the default in checkAnswer, rather than failing
// the whole answer over one date.
const day = z.string().nullable();
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The model's answer as it must come back. */
export const answerSchema = z.object({
  summary: z.array(text(1200)).min(1).max(6),
  sentiment: z.object({ score: z.number(), label: z.enum(SENTIMENTS) }),
  speakers: z.array(z.object({ label: z.string(), personId: z.string().nullable() })),
  lineSentiments: z.array(z.object({ line: lineNumber, sentiment: z.enum(SENTIMENTS) })),
  chapters: z.array(z.object({ title: text(160), firstLine: lineNumber, lastLine: lineNumber })),
  decisions: z.array(z.object({ text: text(500), line: lineNumber.nullable() })),
  actionItems: z.array(
    z.object({
      title: text(160),
      ownerId: z.string().nullable(),
      dueDate: day,
      priority: z.enum(LEVELS),
      line: lineNumber.nullable(),
    }),
  ),
  risks: z.array(z.object({ text: text(500), severity: z.enum(LEVELS), line: lineNumber })),
  insights: z.array(z.object({ text: text(500), line: lineNumber })),
  suggestedTasks: z.array(
    z.object({
      title: text(160),
      ownerId: z.string().nullable(),
      dueDate: day,
      priority: z.enum(LEVELS),
      line: lineNumber,
    }),
  ),
});

export type Answer = z.infer<typeof answerSchema>;

// The same shape as JSON Schema, for the model's structured output.
const str = { type: "string" } as const;
const nullableStr = { type: ["string", "null"] } as const;
const int = { type: "integer" } as const;
const nullableInt = { type: ["integer", "null"] } as const;
const oneOf = (values: readonly string[]) => ({ type: "string", enum: [...values] }) as const;
const object = (properties: Record<string, JsonSchema>): JsonSchema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
});
const list = (items: JsonSchema): JsonSchema => ({ type: "array", items });

export const answerJsonSchema: JsonSchema = object({
  summary: list(str),
  sentiment: object({ score: { type: "number" }, label: oneOf(SENTIMENTS) }),
  speakers: list(object({ label: str, personId: nullableStr })),
  lineSentiments: list(object({ line: int, sentiment: oneOf(SENTIMENTS) })),
  chapters: list(object({ title: str, firstLine: int, lastLine: int })),
  decisions: list(object({ text: str, line: nullableInt })),
  actionItems: list(
    object({
      title: str,
      ownerId: nullableStr,
      dueDate: nullableStr,
      priority: oneOf(LEVELS),
      line: nullableInt,
    }),
  ),
  risks: list(object({ text: str, severity: oneOf(LEVELS), line: int })),
  insights: list(object({ text: str, line: int })),
  suggestedTasks: list(
    object({
      title: str,
      ownerId: nullableStr,
      dueDate: nullableStr,
      priority: oneOf(LEVELS),
      line: int,
    }),
  ),
});

export const SYSTEM_PROMPT = [
  "You analyse the transcript of a team meeting for a meeting intelligence app.",
  "Write every text in the language the meeting was held in.",
  "Point at lines only by the numbers given. Never invent a line number or a person id.",
  "summary: two to four short paragraphs: what the meeting was about, what was decided, what",
  "happens next. sentiment: the meeting's overall mood, score from -1 (tense) to 1 (upbeat).",
  "speakers: for each speaker label, the id of the participant it is, or null when unsure.",
  "lineSentiments: only the lines that are clearly positive or negative.",
  "chapters: two to six stretches about one topic, in order, covering the meeting.",
  "decisions: what the group agreed on, each with the line where it was agreed.",
  "actionItems: work someone took on, with its owner (a participant id), a due date",
  "(YYYY-MM-DD) when one was said or implied, a priority and the line it came from.",
  "suggestedTasks: work that was asked for or needed but that nobody took on; owner is who",
  "should most likely do it. risks: what could go wrong, with how bad it would be.",
  "insights: short observations a manager would want to know, each tied to its line.",
  "Keep titles under 120 characters and every list short; leave a list empty rather than guess.",
].join(" ");

/** The user turn: who took part, when, and the numbered lines. */
export function buildPrompt(input: {
  title: string;
  meetingDay: string;
  participants: Participant[];
  lines: Line[];
}): string {
  const people = input.participants
    .map((p) => `- ${p.id}: ${p.name}${p.role ? ` (${p.role})` : ""}`)
    .join("\n");
  const lines = input.lines.map((line, i) => `${i + 1}. ${line.speaker}: ${line.text}`).join("\n");
  return [
    `Meeting: ${input.title}`,
    `Held on: ${input.meetingDay}`,
    `Participants (id: name):\n${people}`,
    `Transcript:\n${lines}`,
  ].join("\n\n");
}

const DEFAULT_DUE_IN_DAYS = 7;

function addDays(dayValue: string, days: number): string {
  const date = new Date(`${dayValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** What the database call takes (finish_analysis), by line positions from 0. */
export type CheckedAnalysis = {
  speakers: { label: string; person_id: string | null }[];
  segment_sentiments: { position: number; sentiment: string }[];
  summary: string[];
  sentiment: { score: number; label: string };
  chapters: { title: string; first: number; last: number }[];
  decisions: { text: string; position: number | null }[];
  risks: { text: string; severity: string; position: number }[];
  insights: { text: string; position: number }[];
  suggested_tasks: Task[];
  action_items: (Omit<Task, "position"> & { position: number | null })[];
};

type Task = {
  title: string;
  owner_id: string;
  due_date: string;
  priority: string;
  position: number;
};

/**
 * Keeps what the answer may say: lines that exist, people who took part, real days. A task
 * without a valid owner goes to who said its line, else to the first participant; a task
 * without a valid day is due a week after the meeting.
 */
export function checkAnswer(
  answer: Answer,
  input: { participants: Participant[]; lines: Line[]; meetingDay: string; labels: string[] },
  knownSpeakers: Map<string, string | null>,
): CheckedAnalysis {
  const count = input.lines.length;
  const people = new Set(input.participants.map((p) => p.id));
  const position = (line: number | null) =>
    line !== null && line >= 1 && line <= count ? line - 1 : null;

  const speakerOf = new Map<string, string | null>();
  for (const label of input.labels) speakerOf.set(label, knownSpeakers.get(label) ?? null);
  for (const s of answer.speakers) {
    if (!speakerOf.has(s.label) || speakerOf.get(s.label)) continue;
    speakerOf.set(s.label, s.personId && people.has(s.personId) ? s.personId : null);
  }
  const fallbackOwner = input.participants[0].id;
  const ownerFor = (ownerId: string | null, at: number | null) => {
    if (ownerId && people.has(ownerId)) return ownerId;
    const saidBy = at === null ? null : speakerOf.get(input.lines[at].speaker);
    return saidBy ?? fallbackOwner;
  };
  const dueFor = (dueDate: string | null) =>
    dueDate && DAY.test(dueDate) && !Number.isNaN(Date.parse(dueDate))
      ? dueDate
      : addDays(input.meetingDay, DEFAULT_DUE_IN_DAYS);
  const placed = <T extends { line: number | null }>(items: T[]) =>
    items.flatMap((item) => {
      const at = position(item.line);
      return at === null ? [] : [{ item, at }];
    });

  return {
    speakers: [...speakerOf].map(([label, personId]) => ({ label, person_id: personId })),
    segment_sentiments: placed(answer.lineSentiments).map(({ item, at }) => ({
      position: at,
      sentiment: item.sentiment,
    })),
    summary: answer.summary,
    sentiment: {
      score: Math.max(-1, Math.min(1, Math.round(answer.sentiment.score * 100) / 100)),
      label: answer.sentiment.label,
    },
    chapters: answer.chapters
      .flatMap((c) => {
        const first = position(c.firstLine);
        const last = position(c.lastLine);
        return first === null || last === null || last < first
          ? []
          : [{ title: c.title, first, last }];
      })
      .sort((a, b) => a.first - b.first),
    decisions: answer.decisions.map((d) => ({ text: d.text, position: position(d.line) })),
    risks: placed(answer.risks).map(({ item, at }) => ({
      text: item.text,
      severity: item.severity,
      position: at,
    })),
    insights: placed(answer.insights).map(({ item, at }) => ({ text: item.text, position: at })),
    suggested_tasks: placed(answer.suggestedTasks).map(({ item, at }) => ({
      title: item.title,
      owner_id: ownerFor(item.ownerId, at),
      due_date: dueFor(item.dueDate),
      priority: item.priority,
      position: at,
    })),
    action_items: answer.actionItems.map((a) => {
      const at = position(a.line);
      return {
        title: a.title,
        owner_id: ownerFor(a.ownerId, at),
        due_date: dueFor(a.dueDate),
        priority: a.priority,
        position: at,
      };
    }),
  };
}

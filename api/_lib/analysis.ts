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
  // Lenient: a meeting with a title of its own never uses it, so a bad one is not a failure.
  title: z.string().catch(""),
  summary: z.array(text(1200)).min(1).max(6),
  sentiment: z.object({ score: z.number(), label: z.enum(SENTIMENTS) }),
  speakers: z.array(
    z.object({
      label: z.string(),
      personId: z.string().nullable(),
      name: z.string().nullable().catch(null),
    }),
  ),
  lineSentiments: z.array(z.object({ line: lineNumber, sentiment: z.enum(SENTIMENTS) })),
  chapters: z.array(z.object({ title: text(160), firstLine: lineNumber, lastLine: lineNumber })),
  decisions: z.array(z.object({ text: text(500), line: lineNumber.nullable() })),
  actionItems: z.array(
    z.object({
      title: text(160),
      owner: z.string().nullable(),
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
      owner: z.string().nullable(),
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
  title: str,
  summary: list(str),
  sentiment: object({ score: { type: "number" }, label: oneOf(SENTIMENTS) }),
  speakers: list(object({ label: str, personId: nullableStr, name: nullableStr })),
  lineSentiments: list(object({ line: int, sentiment: oneOf(SENTIMENTS) })),
  chapters: list(object({ title: str, firstLine: int, lastLine: int })),
  decisions: list(object({ text: str, line: nullableInt })),
  actionItems: list(
    object({
      title: str,
      owner: nullableStr,
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
      owner: nullableStr,
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
  "title: a short title for the meeting, under 80 characters.",
  "speakers: for each speaker label, personId: the id of the participant it is, or null when",
  "unsure; name: the name this voice introduces itself with or is called by in the meeting,",
  "written as said, or null when no name is said. Never guess a name.",
  "lineSentiments: only the lines that are clearly positive or negative.",
  "chapters: two to six stretches about one topic, in order, covering the meeting.",
  "decisions: what the group agreed on, each with the line where it was agreed.",
  "actionItems: work someone took on, with its owner (a participant id, else the speaker label",
  "of who took it on, else null), a due date",
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
    `Participants (id: name):\n${people || "none were picked: tell who is who from the talk"}`,
    `Transcript:\n${lines}`,
  ].join("\n\n");
}

const DEFAULT_DUE_IN_DAYS = 7;

function addDays(dayValue: string, days: number): string {
  const date = new Date(`${dayValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const NAME_MAX = 120;
const MEETING_TITLE_MAX = 160;
// The labels that name nobody: "Speaker", "Person 2" (speech to text, or a file without names).
const GENERIC_LABEL = /^(speaker|person)(\s+\d+)?$/i;

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * The person a name plainly means: the whole name, or a first name only one of them has.
 * Null when nobody, or more than one person, fits.
 */
export function personIdByName(name: string, people: Participant[]): string | null {
  const key = cleanName(name);
  if (!key) return null;
  const whole = people.filter((p) => cleanName(p.name) === key);
  if (whole.length === 1) return whole[0].id;
  if (whole.length > 1 || key.includes(" ")) return null;
  const first = people.filter((p) => cleanName(p.name).split(" ")[0] === key);
  return first.length === 1 ? first[0].id : null;
}

/** A voice: the person it is, or else the name it is called by, for a new person. */
type Speaker = { label: string; person_id: string | null; name: string | null };

/** What the database call takes (finish_analysis), by line positions from 0. */
export type CheckedAnalysis = {
  title: string | null;
  speakers: Speaker[];
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
  /** The owner when known; else owner_label, the voice the database finds the person of. */
  owner_id: string | null;
  owner_label: string | null;
  due_date: string;
  priority: string;
  position: number;
};

/**
 * Who each voice is: a participant the label or the model names; else someone on the team (or a
 * new person) by the name the voice is called in the meeting, or by a label that is a name.
 * A voice with no name stays unplaced, for "Who is Person 1?".
 */
function placeSpeakers(
  answer: Answer,
  input: { participants: Participant[]; directory: Participant[]; labels: string[] },
  knownSpeakers: Map<string, string | null>,
): Map<string, Speaker> {
  const participants = new Set(input.participants.map((p) => p.id));
  const heard = new Map(answer.speakers.map((s) => [s.label, s]));
  return new Map(
    input.labels.map((label) => {
      const said = heard.get(label);
      const picked =
        knownSpeakers.get(label) ??
        (said?.personId && participants.has(said.personId) ? said.personId : null);
      if (picked) return [label, { label, person_id: picked, name: null }];

      const name = (said?.name?.trim() || (GENERIC_LABEL.test(label) ? "" : label))
        .replace(/\s+/g, " ")
        .slice(0, NAME_MAX);
      if (!name) return [label, { label, person_id: null, name: null }];
      const known = personIdByName(name, input.directory);
      return [label, { label, person_id: known, name: known ? null : name }];
    }),
  );
}

/**
 * Keeps what the answer may say: lines that exist, people on the team, real days. A task's
 * owner is a participant the model names, else the voice it names or that said its line; the
 * database gives a task nobody can be placed for to who uploaded the meeting. A task without a
 * valid day is due a week after the meeting.
 */
export function checkAnswer(
  answer: Answer,
  input: {
    participants: Participant[];
    /** Everyone on the team, for the names said in the meeting. */
    directory: Participant[];
    lines: Line[];
    meetingDay: string;
    labels: string[];
  },
  knownSpeakers: Map<string, string | null>,
): CheckedAnalysis {
  const count = input.lines.length;
  const participants = new Set(input.participants.map((p) => p.id));
  const position = (line: number | null) =>
    line !== null && line >= 1 && line <= count ? line - 1 : null;

  const speakerOf = placeSpeakers(answer, input, knownSpeakers);
  const ownerFor = (owner: string | null, at: number | null) => {
    if (owner && participants.has(owner)) return { owner_id: owner, owner_label: null };
    const label =
      owner && speakerOf.has(owner) ? owner : at === null ? null : input.lines[at].speaker;
    const id = label ? (speakerOf.get(label)?.person_id ?? null) : null;
    return { owner_id: id, owner_label: id ? null : label };
  };
  const title = answer.title.trim().replace(/\s+/g, " ").slice(0, MEETING_TITLE_MAX);
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
    title: title || null,
    speakers: [...speakerOf.values()],
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
      ...ownerFor(item.owner, at),
      due_date: dueFor(item.dueDate),
      priority: item.priority,
      position: at,
    })),
    action_items: answer.actionItems.map((a) => {
      const at = position(a.line);
      return {
        title: a.title,
        ...ownerFor(a.owner, at),
        due_date: dueFor(a.dueDate),
        priority: a.priority,
        position: at,
      };
    }),
  };
}

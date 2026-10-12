import { addDays, format, nextDay, nextFriday, parseISO, type Day } from "date-fns";
import type { Person, Priority, SuggestedTask, TranscriptSegment } from "@/types";
import { MODEL_LATENCY, delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import { copy, db } from "./store";

// The mock's stand-in for the model that reads a sentence and drafts a task from it. It looks
// for a request ("can you …", "I'll …"), a person named in it, a day and words of urgency. Live
// mode sends the sentence and the talk around it to a language model instead.

const TITLE_MAX = 160;
const DEFAULT_DUE_IN_DAYS = 7;
const WEEKDAYS: Record<string, Day> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
};

const SELF_PROMISE = /\bI(?:'ll| will)\s+([^.?!]+)/i;
const REQUESTS = [/\b(?:can|could|would) you\s+([^.?!]+)/i, /\bwe (?:need|have) to\s+([^.?!]+)/i];
const URGENT = /\b(blocker|crash(?:es)?|broken|fails?|failure|urgent|must|asap|freeze)\b/i;
const NOT_URGENT = /\b(later|someday|nice to have|after (?:the )?beta|next quarter|q1)\b/i;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function cut(text: string): string {
  if (text.length <= TITLE_MAX) return text;
  return `${text.slice(0, text.lastIndexOf(" ", TITLE_MAX - 1))}…`;
}

// The first sentence with some substance: "A week?" is skipped for what follows it.
function mainSentence(text: string): string {
  const sentences = text.match(/[^.?!]+[.?!]?/g) ?? [text];
  const main = sentences.find((s) => s.trim().split(/\s+/).length >= 4) ?? sentences[0];
  return main.trim().replace(/[.?!]$/, "");
}

function draftTitle(text: string): { title: string; selfPromise: boolean } {
  const promise = text.match(SELF_PROMISE);
  if (promise) return { title: cut(capitalize(promise[1].trim())), selfPromise: true };
  for (const pattern of REQUESTS) {
    const request = text.match(pattern);
    if (request) return { title: cut(capitalize(request[1].trim())), selfPromise: false };
  }
  return { title: cut(`Follow up: ${mainSentence(text)}`), selfPromise: false };
}

function namedPerson(text: string, people: Person[]): Person | undefined {
  return people.find((person) => new RegExp(`\\b${person.name.split(" ")[0]}\\b`).test(text));
}

function draftDueDate(text: string, meetingDate: string): string {
  const day = parseISO(meetingDate);
  const lower = text.toLowerCase();
  let due = addDays(day, DEFAULT_DUE_IN_DAYS);
  if (/\btoday\b|\btonight\b/.test(lower)) due = day;
  else if (/\btomorrow\b/.test(lower)) due = addDays(day, 1);
  else if (/\bend of (?:the )?week\b|\bthis week\b/.test(lower)) due = nextFriday(day);
  else {
    const weekday = Object.keys(WEEKDAYS).find((name) => lower.includes(name));
    if (weekday) due = nextDay(day, WEEKDAYS[weekday]);
  }
  return `${format(due, "yyyy-MM-dd")}T00:00:00.000Z`;
}

function draftPriority(text: string): Priority {
  if (URGENT.test(text)) return "high";
  if (NOT_URGENT.test(text)) return "low";
  return "medium";
}

function draft(segment: TranscriptSegment): Omit<SuggestedTask, "id"> {
  const meeting = db().meetings.get(segment.meetingId);
  if (!meeting) throw new Error(`Unknown meeting ${segment.meetingId}`);
  const others = seed.people.filter(
    (person) => meeting.participantIds.includes(person.id) && person.id !== segment.speakerId,
  );
  const { title, selfPromise } = draftTitle(segment.text);
  const owner = selfPromise ? undefined : namedPerson(segment.text, others);
  return {
    meetingId: segment.meetingId,
    segmentId: segment.id,
    title,
    ownerId: owner?.id ?? segment.speakerId,
    dueDate: draftDueDate(segment.text, meeting.date),
    priority: draftPriority(segment.text),
  };
}

/** A task drafted from a sentence, for the task dialog to fill its fields with. Not kept. */
export async function draftTask(segmentId: string): Promise<Omit<SuggestedTask, "id">> {
  await delay(MODEL_LATENCY);
  const segment = db().segments.find((s) => s.id === segmentId);
  if (!segment) throw new Error("That sentence is no longer in the transcript.");
  return copy(draft(segment));
}

/** Takes a suggested task out without making it, when nobody wants it. */
export async function dismissSuggestedTask(id: string): Promise<void> {
  await delay();
  const store = db();
  if (!store.suggestedTasks.some((s) => s.id === id)) throw new Error(`Unknown suggestion ${id}`);
  store.suggestedTasks = store.suggestedTasks.filter((s) => s.id !== id);
}

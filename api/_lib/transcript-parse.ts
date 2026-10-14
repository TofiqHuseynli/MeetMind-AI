// Turns an uploaded transcript file into speaker turns. SRT and VTT bring their own times; a
// plain text file brings none, so its times are estimated from how long the words take to say.

export type ParsedLine = {
  /** Who spoke as the file names them ("Amira", "Speaker 1"); matched to people later. */
  speaker: string;
  startSec: number;
  endSec: number;
  text: string;
};

/** The label of a line nobody in the file is named for. */
export const UNNAMED_SPEAKER = "Speaker";

// Spoken English runs at about 150 words a minute.
const WORDS_PER_SECOND = 2.5;
const MIN_LINE_SEC = 2;
// Caption files cut speech into short cues; cues of one speaker this close together and this
// short are one sentence group for the analysis.
const MERGE_GAP_SEC = 2;
const MERGE_MAX_CHARS = 320;
// Enough for a long meeting while the whole transcript still fits in one model call.
export const MAX_LINES = 1500;

// "Amira:", "Jonas Weber:", "Speaker 2:" at the start of a line. A name is up to four words of
// letters, so "Note: the deadline" or a time like "10:30" is not taken for a speaker.
const SPEAKER_PREFIX = /^\s*([\p{L}][\p{L}'.-]*(?:\s+[\p{L}0-9][\p{L}0-9'.-]*){0,3})\s*:\s+(.+)$/u;
const NOT_NAMES = new Set(["note", "notes", "action", "decision", "todo", "agenda", "summary"]);

function speakerOf(text: string): { speaker: string | null; text: string } {
  const match = text.match(SPEAKER_PREFIX);
  if (!match || NOT_NAMES.has(match[1].toLowerCase())) return { speaker: null, text };
  return { speaker: match[1].trim(), text: match[2].trim() };
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function secondsToSay(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(MIN_LINE_SEC, words / WORDS_PER_SECOND);
}

/** "00:01:02,500", "01:02.500" or "1:02.5" as seconds; null for anything else. */
function parseTime(value: string): number | null {
  const match = value.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?$/);
  if (!match) return null;
  const [, h, m, s, frac] = match;
  return Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s) + Number(`0.${frac ?? 0}`);
}

type Cue = { startSec: number; endSec: number; text: string };

/** The timed cues of an SRT or VTT file: a "start --> end" line and the text lines under it. */
function parseCues(content: string): Cue[] {
  const cues: Cue[] = [];
  const blocks = content.replace(/\r/g, "").split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const timing = lines.findIndex((line) => line.includes("-->"));
    if (timing === -1) continue;
    const [from, to] = lines[timing].split("-->").map((part) => part.trim().split(/\s+/)[0]);
    const startSec = parseTime(from);
    const endSec = parseTime(to);
    if (startSec === null || endSec === null) continue;
    const text = lines.slice(timing + 1).join(" ");
    if (text) cues.push({ startSec, endSec: Math.max(endSec, startSec), text });
  }
  return cues;
}

/** VTT names its speakers with a voice tag: "<v Amira Haddad>Let's start". */
function voiceOf(text: string): { speaker: string | null; text: string } {
  const voice = text.match(/^<v(?:\.[^\s>]*)?\s+([^>]+)>/);
  if (voice) return { speaker: voice[1].trim(), text: cleanText(text) };
  return speakerOf(cleanText(text));
}

function fromCues(cues: Cue[]): ParsedLine[] {
  const lines: ParsedLine[] = [];
  let current = UNNAMED_SPEAKER;
  for (const cue of cues) {
    const { speaker, text } = voiceOf(cue.text);
    if (speaker) current = speaker;
    if (!text) continue;
    const last = lines.at(-1);
    const sameTurn =
      last &&
      last.speaker === current &&
      cue.startSec - last.endSec <= MERGE_GAP_SEC &&
      last.text.length + text.length <= MERGE_MAX_CHARS;
    if (sameTurn) {
      last.text = `${last.text} ${text}`;
      last.endSec = Math.max(last.endSec, cue.endSec);
    } else {
      lines.push({ speaker: current, startSec: cue.startSec, endSec: cue.endSec, text });
    }
  }
  return lines;
}

/**
 * A plain text transcript: "Name: text" lines, a line without a name going on with the last
 * speaker. Without any name at all, each paragraph is one line of an unnamed speaker.
 */
function fromText(content: string): ParsedLine[] {
  const rows = content.replace(/\r/g, "").split("\n").map((row) => row.trim());
  const named = rows.some((row) => speakerOf(row).speaker);
  const turns: { speaker: string; text: string }[] = [];

  if (named) {
    for (const row of rows) {
      if (!row) continue;
      const { speaker, text } = speakerOf(row);
      const last = turns.at(-1);
      const clean = cleanText(text);
      if (speaker || !last) turns.push({ speaker: speaker ?? UNNAMED_SPEAKER, text: clean });
      else last.text = `${last.text} ${clean}`;
    }
  } else {
    for (const paragraph of content.replace(/\r/g, "").split(/\n\s*\n/)) {
      const text = cleanText(paragraph);
      if (text) turns.push({ speaker: UNNAMED_SPEAKER, text });
    }
  }

  let at = 0;
  return turns.map((turn) => {
    const length = secondsToSay(turn.text);
    const line = { ...turn, startSec: Math.round(at), endSec: Math.round(at + length) };
    at += length + 1;
    return line;
  });
}

/**
 * The speaker turns of a transcript file, by its ending. Throws when nothing in it reads as
 * speech, so the meeting fails with that reason instead of being analysed empty.
 */
export function parseTranscript(content: string, fileName: string): ParsedLine[] {
  const ending = fileName.toLowerCase().split(".").at(-1);
  const timed = ending === "srt" || ending === "vtt" || content.includes("-->");
  const lines = timed ? fromCues(parseCues(content)) : fromText(content);
  if (lines.length === 0) throw new Error("The file has no text to analyse.");
  if (lines.length > MAX_LINES) {
    throw new Error(
      `The transcript has ${lines.length} lines; the most it can take is ${MAX_LINES}.`,
    );
  }
  return lines;
}

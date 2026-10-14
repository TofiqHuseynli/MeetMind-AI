import {
  answerJsonSchema,
  answerSchema,
  buildPrompt,
  checkAnswer,
  SYSTEM_PROMPT,
  type Line,
  type Participant,
} from "./analysis.js";
import { languageModel } from "./llm/index.js";
import { supabaseAdmin } from "./supabase-admin.js";
import { transcribeRecording } from "./transcribe.js";
import { parseTranscript, type ParsedLine } from "./transcript-parse.js";

// The analysis of one processing meeting, from its file to a ready meeting. A recording is
// turned into speaker turns first (Deepgram); then a recording and a transcript go the same way.
// Any failure leaves the meeting failed, with a reason the meeting page shows and Retry starts
// again from.

const REASON_MAX = 300;

async function readMeeting(meetingId: string) {
  const db = supabaseAdmin();
  const { data: meeting, error } = await db
    .from("meetings")
    .select("id, title, date, status, source_kind, source_path, source_file_name")
    .eq("id", meetingId)
    .maybeSingle();
  if (error) throw error;
  if (!meeting) throw new Error("The meeting no longer exists.");
  if (meeting.status !== "processing") throw new Error("The meeting is not being processed.");

  const { data: rows, error: peopleError } = await db
    .from("meeting_participants")
    .select("people(id, name, role)")
    .eq("meeting_id", meetingId);
  if (peopleError) throw peopleError;
  const participants: Participant[] = (rows ?? []).flatMap((row) =>
    row.people ? [{ id: row.people.id, name: row.people.name, role: row.people.role }] : [],
  );
  if (participants.length === 0) throw new Error("The meeting has nobody who took part.");
  return { meeting, participants };
}

/** A text transcript's lines, from its file in Storage. */
async function linesOfFile(path: string, fileName: string): Promise<ParsedLine[]> {
  const { data, error } = await supabaseAdmin().storage.from("meeting-files").download(path);
  if (error || !data) throw new Error("The transcript file could not be read from Storage.");
  return parseTranscript(await data.text(), fileName);
}

/**
 * The speaker labels that plainly name a participant: the whole name, or a first name only one
 * participant has. The model places the rest.
 */
function matchByName(labels: string[], participants: Participant[]): Map<string, string | null> {
  const clean = (value: string) => value.trim().toLowerCase();
  const byName = new Map(participants.map((p) => [clean(p.name), p.id]));
  const firstNames = new Map<string, string[]>();
  for (const p of participants) {
    const first = clean(p.name).split(/\s+/)[0];
    firstNames.set(first, [...(firstNames.get(first) ?? []), p.id]);
  }
  return new Map(
    labels.map((label) => {
      const key = clean(label);
      const single = firstNames.get(key);
      return [label, byName.get(key) ?? (single?.length === 1 ? single[0] : null)];
    }),
  );
}

async function markFailed(meetingId: string, reason: string): Promise<void> {
  await supabaseAdmin()
    .from("meetings")
    .update({ status: "failed", failure_reason: reason.slice(0, REASON_MAX) })
    .eq("id", meetingId)
    .eq("status", "processing");
}

/** Analyses a processing meeting; the meeting ends ready or failed, never left processing. */
export async function analyzeMeeting(meetingId: string): Promise<"ready" | "failed"> {
  try {
    const { meeting, participants } = await readMeeting(meetingId);
    if (!meeting.source_path) throw new Error("The meeting has no file.");
    const lines =
      meeting.source_kind === "audio"
        ? await transcribeRecording(meeting.source_path)
        : await linesOfFile(meeting.source_path, meeting.source_file_name);

    const labels = [...new Set(lines.map((line) => line.speaker))];
    const known = matchByName(labels, participants);
    const meetingDay = meeting.date.slice(0, 10);
    const prompted: Line[] = lines.map(({ speaker, text }) => ({ speaker, text }));

    const raw = await languageModel().generateJson({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt({ title: meeting.title, meetingDay, participants, lines: prompted }),
      schema: answerJsonSchema,
    });
    const parsed = answerSchema.safeParse(raw);
    if (!parsed.success) throw new Error("The AI answer did not have the expected shape.");
    const checked = checkAnswer(
      parsed.data,
      { participants, lines: prompted, meetingDay, labels },
      known,
    );

    const mood = new Map(checked.segment_sentiments.map((s) => [s.position, s.sentiment]));
    const segments = lines.map((line, position) => ({
      position,
      speaker_label: line.speaker,
      start_sec: line.startSec,
      end_sec: line.endSec,
      text: line.text,
      sentiment: mood.get(position) ?? "neutral",
    }));

    const { error } = await supabaseAdmin().rpc("finish_analysis", {
      p_meeting_id: meeting.id,
      p_analysis: { ...checked, segments },
    });
    if (error) throw new Error(`The analysis could not be saved: ${error.message}`);
    return "ready";
  } catch (error) {
    const reason = error instanceof Error ? error.message : "The analysis failed.";
    console.error(`analysis of ${meetingId} failed:`, error);
    await markFailed(meetingId, reason);
    return "failed";
  }
}

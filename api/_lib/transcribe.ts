import { HttpError } from "./http.js";
import { supabaseAdmin } from "./supabase-admin.js";
import { MAX_LINES, type ParsedLine } from "./transcript-parse.js";

// Speech to text with Deepgram: the recording, read from a short-lived signed link to Storage,
// comes back as speaker turns. Nova-3 tells the speakers apart (diarize) and finds the
// language. The call waits for the result: a 50 MB file (about an hour) takes well under a
// minute, inside the function's time.

const LISTEN_URL =
  "https://api.deepgram.com/v1/listen?model=nova-3&diarize=true&utterances=true" +
  "&smart_format=true&detect_language=true";
// Long enough for Deepgram to fetch the file, short enough to be useless to anyone else.
const SIGNED_URL_SECONDS = 600;

type DeepgramAnswer = {
  err_code?: string;
  err_msg?: string;
  metadata?: { duration?: number };
  results?: {
    utterances?: { start: number; end: number; speaker?: number; transcript: string }[];
  };
};

/** "Person 1", "Person 2": the labels people are matched to, by the model or by hand. */
export function speakerLabel(speaker: number | undefined): string {
  return `Person ${(speaker ?? 0) + 1}`;
}

/** The speaker turns of a recording in Storage. Throws when nothing in it is speech. */
export async function transcribeRecording(path: string): Promise<ParsedLine[]> {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) throw new HttpError(500, "Set DEEPGRAM_API_KEY for speech to text.");

  const { data: signed, error } = await supabaseAdmin()
    .storage.from("meeting-files")
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error || !signed) throw new Error("The recording could not be read from Storage.");

  const response = await fetch(LISTEN_URL, {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url: signed.signedUrl }),
  });
  const answer = (await response.json().catch(() => ({}))) as DeepgramAnswer;
  if (response.status === 402) throw new Error("Speech to text has run out of credit.");
  if (!response.ok) {
    throw new Error(`Speech to text failed: ${answer.err_msg ?? `status ${response.status}`}.`);
  }

  const lines = (answer.results?.utterances ?? [])
    .map((u) => ({
      speaker: speakerLabel(u.speaker),
      startSec: Math.round(u.start * 10) / 10,
      endSec: Math.round(u.end * 10) / 10,
      text: u.transcript.trim(),
    }))
    .filter((line) => line.text);
  if (lines.length === 0) throw new Error("The recording has no speech to analyse.");
  if (lines.length > MAX_LINES) {
    throw new Error(
      `The recording has ${lines.length} turns; the most it can take is ${MAX_LINES}.`,
    );
  }
  return lines;
}

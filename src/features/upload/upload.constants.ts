import type { SourceKind } from "@/types";

/** The file endings the upload takes, per kind, lower case and without the dot. */
export const SOURCE_EXTENSIONS: Record<SourceKind, readonly string[]> = {
  audio: ["mp3", "m4a", "wav", "ogg", "webm", "mp4"],
  // Read as text by the analysis: "Name: what they said" lines, or plain paragraphs.
  transcript: ["txt", "vtt", "srt"],
};

/** The most a file can be on the Supabase Free plan; the bucket refuses anything bigger. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export const sourceKindLabel: Record<SourceKind, string> = {
  audio: "Recording",
  transcript: "Transcript",
};

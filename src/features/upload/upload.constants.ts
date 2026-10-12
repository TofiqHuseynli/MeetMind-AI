import type { ProcessingStep } from "@/components/common/processing-state";
import type { SourceKind } from "@/types";

/** The file endings the upload takes, per kind, lower case and without the dot. */
export const SOURCE_EXTENSIONS: Record<SourceKind, readonly string[]> = {
  audio: ["mp3", "m4a", "wav", "ogg", "webm", "mp4"],
  transcript: ["txt", "vtt", "srt", "docx"],
};

/** About three hours of compressed audio. */
export const MAX_FILE_BYTES = 500 * 1024 * 1024;

export const sourceKindLabel: Record<SourceKind, string> = {
  audio: "Recording",
  transcript: "Transcript",
};

// The mock reports no progress of its own, so the page shows where any analysis stands once
// the file is in. A transcript skips the speech to text.
export const processingSteps: Record<SourceKind, ProcessingStep[]> = {
  audio: [
    { label: "Recording received", state: "done" },
    { label: "Transcribing and telling the speakers apart", state: "current" },
    { label: "Writing the summary, decisions and action items", state: "waiting" },
  ],
  transcript: [
    { label: "Transcript received", state: "done" },
    { label: "Reading the speakers and their turns", state: "current" },
    { label: "Writing the summary, decisions and action items", state: "waiting" },
  ],
};

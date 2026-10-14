import { z } from "zod";
import { SOURCE_KINDS } from "@/types";
import { MAX_FILE_BYTES } from "./upload.constants";

// What the upload form sends. Parsed in upload.api.ts before anything reaches the db.

export const UPLOAD_TITLE_MAX = 160;
const FILE_NAME_MAX = 255;

export const uploadMeetingSchema = z.object({
  file: z.object(
    {
      name: z.string().min(1).max(FILE_NAME_MAX, "Rename the file to something shorter."),
      size: z
        .number()
        .int()
        .positive("The file is empty.")
        .max(MAX_FILE_BYTES, "The file is over 50 MB, the most the project takes."),
      kind: z.enum(SOURCE_KINDS),
    },
    { error: "Choose a recording or a transcript." },
  ),
  title: z
    .string()
    .trim()
    .min(1, "Give the meeting a title.")
    .max(UPLOAD_TITLE_MAX, `Keep it under ${UPLOAD_TITLE_MAX} characters.`),
  teamId: z.string().min(1, "Pick the team."),
  projectId: z.string().min(1, "Pick the project."),
  participantIds: z.array(z.string().min(1)).min(1, "Pick who took part."),
});

/** What the form fills in: the file described, and where the meeting belongs. */
export type UploadMeetingFields = z.infer<typeof uploadMeetingSchema>;

/** What is sent: the fields and the file itself, which must be the one they describe. */
export const uploadMeetingInputSchema = uploadMeetingSchema
  .extend({ blob: z.instanceof(File) })
  .refine(
    (input) => input.blob.size === input.file.size && input.blob.name === input.file.name,
    { path: ["file"], message: "Choose the file again." },
  );

export type UploadMeetingInput = z.infer<typeof uploadMeetingInputSchema>;

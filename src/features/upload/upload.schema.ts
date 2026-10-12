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
        .max(MAX_FILE_BYTES, "The file is over 500 MB."),
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
});

export type UploadMeetingInput = z.infer<typeof uploadMeetingSchema>;

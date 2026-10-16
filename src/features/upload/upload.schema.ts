import { z } from "zod";
import { SOURCE_KINDS } from "@/types";
import { MAX_FILE_BYTES } from "./upload.constants";

// What the upload form sends. Parsed in upload.api.ts before anything reaches the db. Only the
// file is required: an empty title is written by the analysis, no project puts the meeting in
// the Inbox, and no participants lets the analysis find the speakers by name.

export const UPLOAD_TITLE_MAX = 160;
const FILE_NAME_MAX = 255;

const uploadFields = z.object({
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
  title: z.string().trim().max(UPLOAD_TITLE_MAX, `Keep it under ${UPLOAD_TITLE_MAX} characters.`),
  teamId: z.string(),
  projectId: z.string(),
  participantIds: z.array(z.string().min(1)),
});

// A team only narrows the projects: once one is picked, so must be a project of it.
const hasProjectOfTeam = (input: { teamId: string; projectId: string }) =>
  !input.teamId || Boolean(input.projectId);
const projectOfTeamError = { path: ["projectId"], message: "Pick one of the team's projects." };

export const uploadMeetingSchema = uploadFields.refine(hasProjectOfTeam, projectOfTeamError);

/** What the form fills in: the file described, and where the meeting belongs. */
export type UploadMeetingFields = z.infer<typeof uploadMeetingSchema>;

/** What is sent: the fields and the file itself, which must be the one they describe. */
export const uploadMeetingInputSchema = uploadFields
  .extend({ blob: z.instanceof(File) })
  .refine(hasProjectOfTeam, projectOfTeamError)
  .refine(
    (input) => input.blob.size === input.file.size && input.blob.name === input.file.name,
    { path: ["file"], message: "Choose the file again." },
  );

export type UploadMeetingInput = z.infer<typeof uploadMeetingInputSchema>;

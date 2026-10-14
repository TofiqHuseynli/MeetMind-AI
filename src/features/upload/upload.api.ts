import { callApi } from "@/lib/api";
import * as db from "@/supabase/db/uploads";
import type { Meeting } from "@/types";
import { uploadMeetingInputSchema, type UploadMeetingInput } from "./upload.schema";

// The file goes from the browser straight to Storage; the meeting is made with its people;
// api/process starts the work on it. The project must be one of the chosen team's.

/** The new meeting, processing, and whether its work could be started. */
export type UploadResult = { meeting: Meeting; started: boolean };

export async function uploadMeeting(
  input: UploadMeetingInput,
  projectTeamId: (projectId: string) => string | undefined,
): Promise<UploadResult> {
  const { blob, file, title, teamId, projectId, participantIds } =
    uploadMeetingInputSchema.parse(input);
  if (projectTeamId(projectId) !== teamId) throw new Error("Pick a project of the chosen team.");

  const path = db.storagePathFor(file.name);
  await db.uploadMeetingFile(path, blob);
  let meeting: Meeting;
  try {
    meeting = await db.createUpload({
      title,
      projectId,
      kind: file.kind,
      fileName: file.name,
      path,
      participantIds,
    });
  } catch (error) {
    await db.removeMeetingFile(path);
    throw error;
  }

  // The meeting and its file are kept even if the start fails: Retry on its page starts it.
  try {
    await callApi("process", { meetingId: meeting.id });
    return { meeting, started: true };
  } catch {
    return { meeting, started: false };
  }
}

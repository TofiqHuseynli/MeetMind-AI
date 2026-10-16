import { startProcessing } from "@/lib/api";
import * as db from "@/supabase/db/uploads";
import type { Meeting } from "@/types";
import { uploadMeetingInputSchema, type UploadMeetingInput } from "./upload.schema";

// The file goes from the browser straight to Storage; the meeting is made with its people;
// api/process starts the work on it. A project, when picked, must be one of the chosen team's.

export async function uploadMeeting(
  input: UploadMeetingInput,
  projectTeamId: (projectId: string) => string | undefined,
): Promise<Meeting> {
  const { blob, file, title, teamId, projectId, participantIds } =
    uploadMeetingInputSchema.parse(input);
  if (projectId && projectTeamId(projectId) !== teamId) {
    throw new Error("Pick a project of the chosen team.");
  }

  const path = db.storagePathFor(file.name);
  await db.uploadMeetingFile(path, blob);
  let meeting: Meeting;
  try {
    meeting = await db.createUpload({
      title: title || undefined,
      projectId: projectId || undefined,
      kind: file.kind,
      fileName: file.name,
      path,
      participantIds,
    });
  } catch (error) {
    await db.removeMeetingFile(path);
    throw error;
  }

  startProcessing(meeting.id);
  return meeting;
}

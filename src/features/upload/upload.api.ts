import * as db from "@/mock/db";
import type { Meeting } from "@/types";
import { uploadMeetingSchema, type UploadMeetingInput } from "./upload.schema";

// Today these read the mock db. A real service replaces the bodies, nothing else.

/**
 * Sends the file and where the meeting belongs; the service answers with the new meeting,
 * still processing. The project must be one of the chosen team's.
 */
export async function uploadMeeting(input: UploadMeetingInput): Promise<Meeting> {
  const { file, title, teamId, projectId } = uploadMeetingSchema.parse(input);
  const projects = await db.listProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project?.teamId !== teamId) throw new Error("Pick a project of the chosen team.");
  return db.createUpload({ title, projectId, file });
}

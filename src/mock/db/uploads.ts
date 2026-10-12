import type { Meeting, MeetingUpload } from "@/types";
import { delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import { ANALYSIS_MS, startProcessing } from "./processing";
import { copy, db } from "./store";

/**
 * Takes in an uploaded file as a new meeting that is processing, and starts its analysis
 * from the upload template. An unknown project is a bug, so it throws.
 */
export async function createUpload(upload: MeetingUpload): Promise<Meeting> {
  await delay();
  const project = seed.projects.find((p) => p.id === upload.projectId);
  if (!project) throw new Error(`Unknown project ${upload.projectId}`);

  const template = seed.uploadTemplate;
  const meeting: Meeting = {
    id: `mtg_${crypto.randomUUID().slice(0, 8)}`,
    title: upload.title,
    projectId: project.id,
    teamId: project.teamId,
    date: new Date().toISOString(),
    durationMin: template.durationMin,
    participantIds: template.participantIds,
    status: "processing",
    source: { kind: upload.file.kind, fileName: upload.file.name },
    summary: [],
    sentiment: null,
    participation: [],
  };
  const store = db();
  store.meetings.set(meeting.id, meeting);
  startProcessing(store, meeting.id, template, ANALYSIS_MS);
  return copy(meeting);
}

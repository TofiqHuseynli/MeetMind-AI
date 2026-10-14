import type { Meeting, SourceKind } from "@/types";
import { supabase } from "../client";
import { toMeetingListItem } from "../mappers/meeting";
import { check } from "./query";

const BUCKET = "meeting-files";

/**
 * Where a file goes in Storage: a folder of its own, so two files with the same name never meet,
 * and a name with only safe characters.
 */
export function storagePathFor(fileName: string): string {
  const safe = fileName.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${crypto.randomUUID()}/${safe || "file"}`;
}

export async function uploadMeetingFile(path: string, file: File): Promise<void> {
  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error?.message.match(/exceeded|too large|payload/i)) {
    throw new Error("The file is over 50 MB, the most the project takes.");
  }
  if (error) throw new Error(error.message);
}

/** Takes a file back out, when its meeting could not be made. */
export async function removeMeetingFile(path: string): Promise<void> {
  await supabase().storage.from(BUCKET).remove([path]);
}

/** The processing meeting of an uploaded file, with the people who took part. */
export async function createUpload(input: {
  title: string;
  projectId: string;
  kind: SourceKind;
  fileName: string;
  path: string;
  participantIds: string[];
}): Promise<Meeting> {
  const { data, error } = await supabase().rpc("create_upload", {
    p_title: input.title,
    p_project_id: input.projectId,
    p_source_kind: input.kind,
    p_source_file_name: input.fileName,
    p_source_path: input.path,
    p_participant_ids: input.participantIds,
  });
  if (error?.code === "23503") throw new Error("The project or a participant no longer exists.");
  if (error) throw new Error(error.message);
  const row = check(
    await supabase().from("meeting_rows").select("*").eq("id", data.id).maybeSingle(),
  );
  if (!row) throw new Error("The new meeting could not be read back.");
  return toMeetingListItem(row);
}

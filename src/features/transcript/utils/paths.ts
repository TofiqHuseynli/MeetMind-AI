import { meetingPath, meetingTabSearch } from "@/features/meetings/utils/paths";

/** The meeting page on its Transcript tab. */
export function transcriptPath(meetingId: string): string {
  return meetingPath(meetingId) + meetingTabSearch(new URLSearchParams(), "transcript");
}

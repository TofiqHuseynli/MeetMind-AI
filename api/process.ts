import { z } from "zod";
import { analyzeMeeting } from "./_lib/analyze.js";
import { requireUser } from "./_lib/auth.js";
import { errorResponse, HttpError, json } from "./_lib/http.js";
import { supabaseAdmin } from "./_lib/supabase-admin.js";

const bodySchema = z.object({ meetingId: z.uuid() });

/**
 * The work on an uploaded or retried meeting, which is processing with its file in Storage. A
 * transcript is analysed here and now, so the function lives until the meeting is ready or
 * failed (Vercel would stop work left after the answer); the browser does not wait for it, the
 * meeting page polls. A recording goes to speech to text first (Task 25).
 */
export async function POST(request: Request): Promise<Response> {
  try {
    await requireUser(request);
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Send the meeting's id.");

    const { data: meeting, error } = await supabaseAdmin()
      .from("meetings")
      .select("id, status, source_kind, source_path")
      .eq("id", parsed.data.meetingId)
      .maybeSingle();
    if (error) throw error;
    if (!meeting) throw new HttpError(404, "That meeting no longer exists.");
    if (meeting.status !== "processing") {
      throw new HttpError(409, "That meeting is not waiting to be processed.");
    }
    if (!meeting.source_path) throw new HttpError(409, "That meeting has no file to process.");

    if (meeting.source_kind === "audio") {
      // Speech to text (Task 25) starts here and calls the analysis when its lines are in.
      return json({ meetingId: meeting.id, next: "transcription" }, 202);
    }
    const status = await analyzeMeeting(meeting.id);
    return json({ meetingId: meeting.id, status });
  } catch (error) {
    return errorResponse(error);
  }
}

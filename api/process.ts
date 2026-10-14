import { z } from "zod";
import { requireUser } from "./_lib/auth.js";
import { errorResponse, HttpError, json } from "./_lib/http.js";
import { supabaseAdmin } from "./_lib/supabase-admin.js";

const bodySchema = z.object({ meetingId: z.uuid() });

/**
 * Starts the work on an uploaded meeting, which the browser has made as processing with its
 * file in Storage. A transcript goes to the analysis, a recording to speech to text first.
 * Answers 202 at once: the meeting page polls until the meeting is ready or failed.
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

    // The analysis (Task 24) and speech to text (Task 25) are started from here.
    const next = meeting.source_kind === "audio" ? "transcription" : "analysis";
    return json({ meetingId: meeting.id, next }, 202);
  } catch (error) {
    return errorResponse(error);
  }
}

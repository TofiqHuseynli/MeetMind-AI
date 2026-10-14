import { z } from "zod";
import { requireUser } from "./_lib/auth.js";
import { draftTask } from "./_lib/draft.js";
import { errorResponse, HttpError, json } from "./_lib/http.js";

const bodySchema = z.object({ segmentId: z.uuid() });

/** "Write with AI": the task fields the model drafts from one sentence, for the task dialog. */
export async function POST(request: Request): Promise<Response> {
  try {
    await requireUser(request);
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Send the sentence's id.");
    return json(await draftTask(parsed.data.segmentId));
  } catch (error) {
    return errorResponse(error);
  }
}

import { z } from "zod";
import { languageModel } from "./llm/index.js";
import type { JsonSchema } from "./llm/types.js";
import { HttpError } from "./http.js";
import { supabaseAdmin } from "./supabase-admin.js";

// "Write with AI": the task fields for one sentence, drafted by the model from the sentence, the
// lines around it and who took part. Nothing is saved; the task dialog shows the fields to check.

const AROUND = 3;
const DEFAULT_DUE_IN_DAYS = 7;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const draftSchema = z.object({
  title: z.string().trim().min(1).max(160),
  ownerId: z.string().nullable(),
  dueDate: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]),
});

const draftJsonSchema: JsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    ownerId: { type: ["string", "null"] },
    dueDate: { type: ["string", "null"] },
    priority: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["title", "ownerId", "dueDate", "priority"],
};

const SYSTEM = [
  "You turn one sentence of a meeting transcript into a task for a task list.",
  "Write the title in the language of the meeting, as a short imperative under 100 characters.",
  "ownerId: the id of the participant who should do it (who offered, or who was asked), or null.",
  "dueDate: YYYY-MM-DD when a day is said or implied, counting from the meeting day, else null.",
  "priority: high when it blocks others or is urgent, low when it is a nice-to-have.",
].join(" ");

export type Draft = { title: string; ownerId: string; dueDate: string; priority: string };

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Drafts the task of one sentence. An unknown sentence is a 404. */
export async function draftTask(segmentId: string): Promise<Draft> {
  const db = supabaseAdmin();
  const { data: line, error } = await db
    .from("transcript_lines")
    .select("meeting_id, position, speaker_person_id")
    .eq("id", segmentId)
    .maybeSingle();
  if (error) throw error;
  if (!line?.meeting_id || line.position === null) {
    throw new HttpError(404, "That sentence is no longer in the transcript.");
  }

  const [nearby, meeting, people] = await Promise.all([
    db
      .from("transcript_lines")
      .select("position, speaker_label, text")
      .eq("meeting_id", line.meeting_id)
      .gte("position", line.position - AROUND)
      .lte("position", line.position + AROUND)
      .order("position"),
    db.from("meetings").select("title, date").eq("id", line.meeting_id).single(),
    db
      .from("meeting_participants")
      .select("people(id, name, role)")
      .eq("meeting_id", line.meeting_id),
  ]);
  if (nearby.error || meeting.error || people.error) {
    throw nearby.error ?? meeting.error ?? people.error;
  }
  const participants = (people.data ?? []).flatMap((row) => (row.people ? [row.people] : []));
  if (participants.length === 0) throw new HttpError(409, "The meeting has nobody who took part.");

  const meetingDay = meeting.data.date.slice(0, 10);
  const context = (nearby.data ?? [])
    .map((l) => `${l.position === line.position ? ">>" : "  "} ${l.speaker_label}: ${l.text}`)
    .join("\n");
  const roster = participants.map((p) => `- ${p.id}: ${p.name} (${p.role})`).join("\n");
  const prompt = [
    `Meeting: ${meeting.data.title}, held on ${meetingDay}`,
    `Participants (id: name):\n${roster}`,
    `Lines around it; the sentence the task comes from is marked >>:\n${context}`,
  ].join("\n\n");

  const parsed = draftSchema.safeParse(
    await languageModel().generateJson({
      system: SYSTEM,
      prompt,
      schema: draftJsonSchema,
      fast: true,
    }),
  );
  if (!parsed.success) throw new HttpError(502, "The AI answer did not have the expected shape.");
  const draft = parsed.data;

  const ids = new Set(participants.map((p) => p.id));
  const said = line.speaker_person_id;
  const saidBy = said && ids.has(said) ? said : null;
  const due = draft.dueDate;
  const dueOk = due !== null && DAY.test(due) && !Number.isNaN(Date.parse(due));
  const ownerOk = draft.ownerId !== null && ids.has(draft.ownerId);
  return {
    title: draft.title,
    ownerId: ownerOk && draft.ownerId ? draft.ownerId : (saidBy ?? participants[0].id),
    dueDate: dueOk ? due : addDays(meetingDay, DEFAULT_DUE_IN_DAYS),
    priority: draft.priority,
  };
}

import type { Decision, DecisionListItem } from "@/types";
import { supabase } from "../client";
import { toDecision } from "../mappers/insight";
import { speakerIdOf } from "../mappers/transcript";
import { check, rows } from "./query";

/**
 * A meeting's decisions in the order they were said, each with its sentence's speaker and time.
 * Decisions added by hand have no sentence and come last, in the order they were added.
 */
export async function listDecisions(meetingId: string): Promise<DecisionListItem[]> {
  const decisions = rows(
    await supabase()
      .from("decisions")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("created_at")
      .order("id"),
  );
  const segmentIds = decisions.flatMap((d) => (d.segment_id ? [d.segment_id] : []));
  const sentences = segmentIds.length
    ? rows(
        await supabase()
          .from("transcript_lines")
          .select("id, speaker_label, speaker_person_id, start_sec")
          .in("id", segmentIds),
      )
    : [];
  const sentenceById = new Map(sentences.map((line) => [line.id, line]));

  const items = decisions.map((row): DecisionListItem => {
    const line = row.segment_id ? sentenceById.get(row.segment_id) : undefined;
    const sentence =
      line?.id && line.start_sec !== null
        ? {
            id: line.id,
            speakerId: speakerIdOf(line.speaker_person_id, line.speaker_label ?? ""),
            startSec: line.start_sec,
          }
        : null;
    return { ...toDecision(row), sentence };
  });
  // The sort is stable, so equal times keep the order the decisions were added in.
  return items.sort((a, b) => sortTime(a) - sortTime(b));
}

function sortTime(item: DecisionListItem): number {
  return item.sentence?.startSec ?? Number.MAX_SAFE_INTEGER;
}

/** Adds a decision. A sentence it points at must be one of the same meeting. */
export async function createDecision(input: Omit<Decision, "id">): Promise<Decision> {
  const { data, error } = await supabase()
    .from("decisions")
    .insert({ meeting_id: input.meetingId, segment_id: input.segmentId ?? null, text: input.text })
    .select()
    .single();
  // The composite key refuses a sentence of another meeting, and a meeting that is gone.
  if (error?.code === "23503") throw new Error("That sentence is not part of this meeting.");
  if (error) throw new Error(error.message);
  return toDecision(data);
}

/** By trusted id: a decision that is gone is reported, not created again. */
export async function updateDecision(id: string, patch: { text: string }): Promise<Decision> {
  const row = check(
    await supabase()
      .from("decisions")
      .update({ text: patch.text })
      .eq("id", id)
      .select()
      .maybeSingle(),
  );
  if (!row) throw new Error("This decision was deleted.");
  return toDecision(row);
}

export async function deleteDecision(id: string): Promise<void> {
  check(await supabase().from("decisions").delete().eq("id", id));
}

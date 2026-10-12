import type { Decision, DecisionListItem, Insight, Risk } from "@/types";
import { delay } from "@/mock/delay";
import { copy, db } from "./store";

/**
 * A meeting's decisions in the order they were said, each with its sentence's speaker and time.
 * Decisions added by hand have no time and come last, in the order they were added.
 */
export async function listDecisions(meetingId: string): Promise<DecisionListItem[]> {
  await delay();
  const store = db();
  const segmentById = new Map(store.segments.map((segment) => [segment.id, segment]));
  const items = store.decisions
    .filter((decision) => decision.meetingId === meetingId)
    .map((decision): DecisionListItem => {
      const segment = decision.segmentId ? segmentById.get(decision.segmentId) : undefined;
      const sentence = segment
        ? { id: segment.id, speakerId: segment.speakerId, startSec: segment.startSec }
        : null;
      return { ...decision, sentence };
    });
  // The sort is stable, so equal times keep the order the decisions were added in.
  items.sort((a, b) => sortTime(a) - sortTime(b));
  return copy(items);
}

function sortTime(item: DecisionListItem): number {
  return item.sentence?.startSec ?? Number.MAX_SAFE_INTEGER;
}

export async function listRisks(meetingId: string): Promise<Risk[]> {
  await delay();
  return copy(db().risks.filter((r) => r.meetingId === meetingId));
}

export async function listInsights(meetingId: string): Promise<Insight[]> {
  await delay();
  return copy(db().insights.filter((i) => i.meetingId === meetingId));
}

/** Adds a decision. A sentence it points at must be one of the same meeting. */
export async function createDecision(input: Omit<Decision, "id">): Promise<Decision> {
  await delay();
  const store = db();
  if (input.segmentId) {
    const segment = store.segments.find((s) => s.id === input.segmentId);
    if (segment?.meetingId !== input.meetingId) {
      throw new Error(`Unknown segment ${input.segmentId}`);
    }
  }
  const decision: Decision = { ...input, id: `dec_${crypto.randomUUID().slice(0, 8)}` };
  store.decisions = [...store.decisions, decision];
  return copy(decision);
}

export async function updateDecision(
  id: string,
  patch: Pick<Decision, "text">,
): Promise<Decision> {
  await delay();
  const store = db();
  const current = store.decisions.find((d) => d.id === id);
  if (!current) throw new Error(`Unknown decision ${id}`);
  const next = { ...current, ...patch };
  store.decisions = store.decisions.map((d) => (d.id === id ? next : d));
  return copy(next);
}

export async function deleteDecision(id: string): Promise<void> {
  await delay();
  const store = db();
  if (!store.decisions.some((d) => d.id === id)) throw new Error(`Unknown decision ${id}`);
  store.decisions = store.decisions.filter((d) => d.id !== id);
}

import type { TranscriptLinks } from "@/types";
import { plural } from "@/utils/text";

function noLinks(): TranscriptLinks {
  return { insights: [], decisions: [], actionItems: [], suggestedTasks: [], risks: [] };
}

/** A meeting's links split by the segment each one points at. */
export function linksBySegment(links: TranscriptLinks): Map<string, TranscriptLinks> {
  const bySegment = new Map<string, TranscriptLinks>();
  const of = (segmentId: string) => {
    let entry = bySegment.get(segmentId);
    if (!entry) {
      entry = noLinks();
      bySegment.set(segmentId, entry);
    }
    return entry;
  };
  for (const item of links.insights) of(item.segmentId).insights.push(item);
  for (const item of links.decisions) {
    if (item.segmentId) of(item.segmentId).decisions.push(item);
  }
  for (const item of links.actionItems) {
    if (item.segmentId) of(item.segmentId).actionItems.push(item);
  }
  for (const item of links.suggestedTasks) of(item.segmentId).suggestedTasks.push(item);
  for (const item of links.risks) of(item.segmentId).risks.push(item);
  return bySegment;
}

/** The links of one segment; empty lists when nothing points at it. */
export function segmentLinks(bySegment: Map<string, TranscriptLinks>, segmentId: string) {
  return bySegment.get(segmentId) ?? noLinks();
}

export function linkCount(links: TranscriptLinks): number {
  return (
    links.insights.length +
    links.decisions.length +
    links.actionItems.length +
    links.suggestedTasks.length +
    links.risks.length
  );
}

/** A label under a line: "Decision" for one, "2 decisions" for more. */
export function linkLabel(count: number, word: string): string {
  return count === 1 ? word : plural(count, word.toLowerCase());
}

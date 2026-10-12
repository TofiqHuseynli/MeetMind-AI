import type { Priority } from "./action-item";
import type { TranscriptSegment } from "./transcript";

export type Decision = {
  id: string;
  meetingId: string;
  /** The sentence where the group agreed on it; none for a decision added by hand. */
  segmentId?: string;
  text: string;
};

/** A decision as the meeting's list returns it, with who said its sentence and when. */
export type DecisionListItem = Decision & {
  /** Null for a decision added by hand. */
  sentence: Pick<TranscriptSegment, "id" | "speakerId" | "startSec"> | null;
};

export const SEVERITIES = ["low", "medium", "high"] as const;
export type Severity = (typeof SEVERITIES)[number];

export type Risk = {
  id: string;
  meetingId: string;
  segmentId: string;
  text: string;
  severity: Severity;
};

export type Insight = {
  id: string;
  meetingId: string;
  segmentId: string;
  text: string;
};

/** A task the analysis proposes for a sentence that asks for work nobody took on yet. */
export type SuggestedTask = {
  id: string;
  meetingId: string;
  segmentId: string;
  title: string;
  ownerId: string;
  dueDate: string;
  priority: Priority;
};

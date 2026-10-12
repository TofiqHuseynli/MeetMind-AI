import { Check, Lightbulb, SquareCheckBig, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TranscriptLinks } from "@/types";
import { linkLabel } from "../../utils/links";

/** What is tied to a segment, as small labels under its text. */
export function SegmentLinks({ links }: { links: TranscriptLinks }) {
  const decisions = links.decisions.length;
  const actionItems = links.actionItems.length;
  const suggestedTasks = links.suggestedTasks.length;
  const risks = links.risks.length;
  if (decisions + actionItems + suggestedTasks + risks === 0) return null;

  return (
    <span className="mt-1.5 flex flex-wrap gap-1.5">
      {decisions > 0 && (
        <Badge variant="decision">
          <Check aria-hidden />
          {linkLabel(decisions, "Decision")}
        </Badge>
      )}
      {actionItems > 0 && (
        <Badge variant="neutral">
          <SquareCheckBig aria-hidden />
          {linkLabel(actionItems, "Task")}
        </Badge>
      )}
      {suggestedTasks > 0 && (
        <Badge variant="outline">
          <Lightbulb aria-hidden />
          {linkLabel(suggestedTasks, "Suggested task")}
        </Badge>
      )}
      {risks > 0 && (
        <Badge variant="medium">
          <TriangleAlert aria-hidden />
          {linkLabel(risks, "Risk")}
        </Badge>
      )}
    </span>
  );
}

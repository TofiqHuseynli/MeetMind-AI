import {
  Check,
  Lightbulb,
  Pencil,
  Sparkles,
  SquareCheckBig,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ActionItem, Decision, Person, SuggestedTask, TranscriptLinks } from "@/types";
import { linkCount } from "../../utils/links";
import { severityLabel } from "../../transcript.constants";
import { ItemActions } from "./item-actions";
import { LinkedSection } from "./linked-section";
import { LinkedTaskRow } from "./linked-task-row";
import { SuggestedTaskCard } from "./suggested-task-card";

/** What the sentence led to, one section per kind; a kind with nothing tied to it is left out. */
export function LinkedItems({
  links,
  personById,
  onEditTask,
  onDeleteTask,
  onEditDecision,
  onDeleteDecision,
  onEditSuggestion,
}: {
  links: TranscriptLinks;
  personById: Map<string, Person>;
  onEditTask: (item: ActionItem) => void;
  onDeleteTask: (item: ActionItem) => void;
  onEditDecision: (decision: Decision) => void;
  onDeleteDecision: (decision: Decision) => void;
  onEditSuggestion: (suggestion: SuggestedTask) => void;
}) {
  const { insights, suggestedTasks, decisions, actionItems, risks } = links;
  if (linkCount(links) === 0) {
    return (
      <p className="text-[13px] leading-6 text-muted-foreground">
        Nothing is tied to this sentence yet. If it asks for work, make it a task.
      </p>
    );
  }

  return (
    <>
      {insights.length > 0 && (
        <LinkedSection icon={Sparkles} title="AI insight" iconClassName="text-primary">
          {insights.map((insight) => (
            <p key={insight.id}>{insight.text}</p>
          ))}
        </LinkedSection>
      )}
      {suggestedTasks.length > 0 && (
        <LinkedSection
          icon={Lightbulb}
          title={suggestedTasks.length === 1 ? "Suggested task" : "Suggested tasks"}
          iconClassName="text-primary"
        >
          {suggestedTasks.map((suggestion) => (
            <SuggestedTaskCard
              key={suggestion.id}
              suggestion={suggestion}
              owner={personById.get(suggestion.ownerId)}
              onEdit={() => onEditSuggestion(suggestion)}
            />
          ))}
        </LinkedSection>
      )}
      {decisions.length > 0 && (
        <LinkedSection
          icon={Check}
          title={decisions.length === 1 ? "Decision" : "Decisions"}
          iconClassName="text-primary"
        >
          {decisions.map((decision) => (
            <div key={decision.id} className="flex items-start gap-2">
              <p className="flex-1 font-medium text-foreground">{decision.text}</p>
              <ItemActions
                label="Actions for this decision"
                actions={[
                  {
                    label: "Edit decision",
                    icon: Pencil,
                    onSelect: () => onEditDecision(decision),
                  },
                  {
                    label: "Delete decision",
                    icon: Trash2,
                    onSelect: () => onDeleteDecision(decision),
                    destructive: true,
                  },
                ]}
              />
            </div>
          ))}
        </LinkedSection>
      )}
      {actionItems.length > 0 && (
        <LinkedSection
          icon={SquareCheckBig}
          title={actionItems.length === 1 ? "Task" : "Tasks"}
          iconClassName="text-muted-foreground"
        >
          <ul className="grid gap-3.5">
            {actionItems.map((item) => (
              <LinkedTaskRow
                key={item.id}
                item={item}
                owner={personById.get(item.ownerId)}
                onEdit={() => onEditTask(item)}
                onDelete={() => onDeleteTask(item)}
              />
            ))}
          </ul>
        </LinkedSection>
      )}
      {risks.length > 0 && (
        <LinkedSection
          icon={TriangleAlert}
          title={risks.length === 1 ? "Risk" : "Risks"}
          iconClassName="text-priority-medium"
        >
          {risks.map((risk) => (
            <div key={risk.id} className="grid justify-items-start gap-1.5">
              <Badge variant={risk.severity}>
                {severityLabel[risk.severity]}
                <span className="sr-only"> severity</span>
              </Badge>
              <p>{risk.text}</p>
            </div>
          ))}
        </LinkedSection>
      )}
    </>
  );
}

import { Pencil, Plus, Trash2 } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { priorityLabel } from "@/features/action-items/action-items.constants";
import { useCreateActionItem } from "@/features/action-items/action-items.queries";
import { dueDay } from "@/features/action-items/utils/due-date";
import type { Person, SuggestedTask } from "@/types";
import { formatShortDay } from "@/utils/format";
import { useDismissSuggestion } from "../../transcript.queries";
import { firstName } from "../../utils/format";

/**
 * A task the analysis suggests for the sentence, ready to make with one click, to change first
 * in the task dialog, or to remove when nobody wants it. Once made, the suggestion goes away.
 */
export function SuggestedTaskCard({
  suggestion,
  owner,
  onEdit,
}: {
  suggestion: SuggestedTask;
  owner?: Person;
  onEdit: () => void;
}) {
  const create = useCreateActionItem();
  const dismiss = useDismissSuggestion();
  const busy = create.isPending || dismiss.isPending;

  function createNow() {
    create.mutate({
      meetingId: suggestion.meetingId,
      segmentId: suggestion.segmentId,
      suggestionId: suggestion.id,
      title: suggestion.title,
      ownerId: suggestion.ownerId,
      dueDate: dueDay(suggestion.dueDate),
      priority: suggestion.priority,
    });
  }

  return (
    <div className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
      <p className="leading-5 font-semibold text-foreground">{suggestion.title}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {owner && (
          <span className="inline-flex items-center gap-1.5">
            <PersonAvatar person={owner} size="sm" tooltip={false} />
            {firstName(owner.name)}
          </span>
        )}
        <span className="tabular-nums">Due {formatShortDay(suggestion.dueDate)}</span>
        <Badge variant={suggestion.priority}>
          {priorityLabel[suggestion.priority]}
          <span className="sr-only"> priority</span>
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" disabled={busy} onClick={createNow}>
          <Plus aria-hidden />
          {create.isPending ? "Saving…" : "Create task"}
        </Button>
        <Button variant="outline" disabled={busy} onClick={onEdit}>
          <Pencil aria-hidden />
          Edit
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Remove suggestion"
              disabled={busy}
              onClick={() =>
                dismiss.mutate({ id: suggestion.id, meetingId: suggestion.meetingId })
              }
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove suggestion</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

import { Pencil, Trash2 } from "lucide-react";
import { PersonAvatar } from "@/components/common/person-avatar";
import { Badge } from "@/components/ui/badge";
import {
  actionStatusBadge,
  actionStatusLabel,
} from "@/features/action-items/action-items.constants";
import type { ActionItem, Person } from "@/types";
import { formatShortDay } from "@/utils/format";
import { firstName } from "../../utils/format";
import { ItemActions } from "./item-actions";

/**
 * A task already made from the sentence: what it is, who owns it, when it is due and its
 * status, with a menu to edit or delete it.
 */
export function LinkedTaskRow({
  item,
  owner,
  onEdit,
  onDelete,
}: {
  item: ActionItem;
  owner?: Person;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="grid gap-1.5">
      <div className="flex items-start gap-2">
        <p className="flex-1 pt-0.5 leading-5 font-semibold text-foreground">{item.title}</p>
        <ItemActions
          label={`Actions for ${item.title}`}
          actions={[
            { label: "Edit task", icon: Pencil, onSelect: onEdit },
            { label: "Delete task", icon: Trash2, onSelect: onDelete, destructive: true },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {owner && (
          <span className="inline-flex items-center gap-1.5">
            <PersonAvatar person={owner} size="sm" tooltip={false} />
            {firstName(owner.name)}
          </span>
        )}
        <span className="tabular-nums">Due {formatShortDay(item.dueDate)}</span>
        <Badge variant={actionStatusBadge[item.status]}>{actionStatusLabel[item.status]}</Badge>
      </div>
    </li>
  );
}

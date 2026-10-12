import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Team } from "@/types";
import type { MeetingTableRow } from "../meeting-columns";
import { MoveToProjectForm } from "./move-to-project-form";

/**
 * The checked meetings move to one project, picked from a searchable list. The form mounts only
 * while open, so the search and the choice start fresh each time.
 */
export function MoveToProjectDialog({
  rows,
  teamById,
  onClose,
}: {
  /** The meetings to move; the dialog is open while there are some. */
  rows: MeetingTableRow[] | null;
  teamById: Map<string, Team>;
  onClose: () => void;
}) {
  return (
    <Dialog open={rows !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-5 sm:max-w-md">
        {rows && <MoveToProjectForm rows={rows} teamById={teamById} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

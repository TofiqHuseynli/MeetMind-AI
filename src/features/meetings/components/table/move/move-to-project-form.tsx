import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Team } from "@/types";
import { plural } from "@/utils/text";
import { useMoveMeetings } from "../../../meetings.queries";
import type { MeetingTableRow } from "../meeting-columns";
import { ProjectPicker } from "./project-picker";

/** The dialog's body: the picker and the move button for the checked meetings. */
export function MoveToProjectForm({
  rows,
  teamById,
  onDone,
}: {
  rows: MeetingTableRow[];
  teamById: Map<string, Team>;
  onDone: () => void;
}) {
  const [projectId, setProjectId] = useState<string>();
  const moveMeetings = useMoveMeetings();
  const projectIds = new Set(rows.map((row) => row.meeting.projectId));
  const currentId = projectIds.size === 1 ? [...projectIds][0] : undefined;
  const count = plural(rows.length, "meeting");

  function move() {
    if (!projectId) return;
    const ids = rows.map((row) => row.meeting.id);
    moveMeetings.mutate({ ids, projectId }, { onSuccess: onDone });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Move {count}</DialogTitle>
        <DialogDescription>
          Pick the project they belong to. Their team changes with it.
        </DialogDescription>
      </DialogHeader>
      <ProjectPicker
        value={projectId}
        onChange={setProjectId}
        currentId={currentId}
        teamById={teamById}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={move}
          disabled={!projectId || projectId === currentId || moveMeetings.isPending}
        >
          {moveMeetings.isPending ? "Moving…" : `Move ${count}`}
        </Button>
      </DialogFooter>
    </>
  );
}

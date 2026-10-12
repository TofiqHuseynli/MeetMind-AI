import {
  Download,
  FileSpreadsheet,
  FileText,
  FolderInput,
  RotateCcw,
  Sheet,
  Trash2,
} from "lucide-react";
import type { BulkAction, BulkChoice } from "@/components/data-table/data-table-features";
import { EXPORT_FORMATS } from "@/types";
import { plural } from "@/utils/text";
import {
  useDeleteMeetings,
  useExportMeetings,
  useRetryProcessing,
} from "../../meetings.queries";
import type { MeetingTableRow } from "./meeting-columns";

const idsOf = (rows: MeetingTableRow[]) => rows.map((row) => row.meeting.id);

const exportChoices: BulkChoice[] = [
  { value: "csv", label: "CSV", hint: "Plain rows for any tool", icon: Sheet },
  {
    value: "xlsx",
    label: "Excel",
    hint: "A sheet with real dates and numbers",
    icon: FileSpreadsheet,
  },
  { value: "pdf", label: "PDF", hint: "A report to share or print", icon: FileText },
];

/** What the meeting table can do with the checked rows. Moving opens the view's dialog. */
export function useMeetingBulkActions({
  onMove,
}: {
  onMove: (rows: MeetingTableRow[]) => void;
}): BulkAction<MeetingTableRow>[] {
  const exportMeetings = useExportMeetings();
  const retryProcessing = useRetryProcessing();
  const deleteMeetings = useDeleteMeetings();

  return [
    {
      label: "Export",
      pendingLabel: "Exporting…",
      icon: Download,
      pending: exportMeetings.isPending,
      choices: exportChoices,
      onChoose: (rows, value) => {
        const format = EXPORT_FORMATS.find((f) => f === value);
        if (format) exportMeetings.mutate({ ids: idsOf(rows), format });
      },
    },
    {
      label: "Move to project",
      icon: FolderInput,
      onRun: onMove,
    },
    {
      label: "Retry processing",
      icon: RotateCcw,
      pending: retryProcessing.isPending,
      appliesTo: (row) => row.meeting.status === "failed",
      onRun: (rows) => retryProcessing.mutate(idsOf(rows)),
    },
    {
      label: "Delete",
      icon: Trash2,
      destructive: true,
      pending: deleteMeetings.isPending,
      confirm: {
        title: (count) => `Delete ${plural(count, "meeting")}?`,
        description:
          "Their transcripts, decisions, risks and action items go with them. " +
          "This cannot be undone.",
      },
      onRun: (rows) => deleteMeetings.mutate(idsOf(rows)),
    },
  ];
}

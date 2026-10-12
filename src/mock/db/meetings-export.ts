import { format, parseISO } from "date-fns";
import type { ExportFile, ExportFormat, Meeting, MeetingStatus } from "@/types";
import { delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import { NO_ACTIONS, actionCountsByMeeting, totalCount } from "./action-counts";
import { writeCsv } from "./export/csv";
import { writePdf } from "./export/pdf";
import type { ExportCell, ExportColumn, ExportTable, ExportTone } from "./export/table";
import { writeXlsx } from "./export/xlsx";
import { db } from "./store";

const columns: ExportColumn[] = [
  { header: "Title", width: 40 },
  { header: "Date", width: 18 },
  { header: "Team", width: 14 },
  { header: "Project", width: 22 },
  { header: "Status", width: 12 },
  { header: "Sentiment", width: 12 },
  { header: "Tasks done", width: 11, align: "right" },
  { header: "Tasks total", width: 11, align: "right" },
  { header: "Overdue", width: 10, align: "right" },
];

const statusTone: Record<MeetingStatus, ExportTone> = {
  ready: "positive",
  processing: "warning",
  failed: "negative",
};

const writers: Record<ExportFormat, (table: ExportTable) => Blob | Promise<Blob>> = {
  csv: writeCsv,
  xlsx: writeXlsx,
  pdf: writePdf,
};

function meetingTable(meetings: Meeting[]): ExportTable {
  const counts = actionCountsByMeeting();
  const teamName = new Map(seed.teams.map((t) => [t.id, t.name]));
  const projectName = new Map(seed.projects.map((p) => [p.id, p.name]));
  const rows = meetings.map((m): ExportCell[] => {
    const c = m.status === "ready" ? (counts.get(m.id) ?? NO_ACTIONS) : null;
    return [
      { value: m.title },
      { value: parseISO(m.date) },
      { value: teamName.get(m.teamId) ?? null },
      { value: projectName.get(m.projectId) ?? null },
      { value: m.status, tone: statusTone[m.status] },
      { value: m.sentiment?.label ?? null },
      { value: c ? c.done : null },
      { value: c ? totalCount(c) : null },
      { value: c ? c.overdue : null, tone: c?.overdue ? "negative" : undefined },
    ];
  });
  const exported = format(new Date(), "d MMM yyyy, HH:mm");
  const count = `${meetings.length} ${meetings.length === 1 ? "meeting" : "meetings"}`;
  return { title: "Meetings", subtitle: `${count}, exported ${exported}`, columns, rows };
}

/** The meetings as a file in the asked format, newest first, as the export endpoint sends it. */
export async function exportMeetings(
  ids: string[],
  fileFormat: ExportFormat,
): Promise<ExportFile> {
  await delay();
  const meetings = ids
    .flatMap((id) => db().meetings.get(id) ?? [])
    .sort((a, b) => b.date.localeCompare(a.date));
  const blob = await writers[fileFormat](meetingTable(meetings));
  const fileName = `meetings-${format(new Date(), "yyyy-MM-dd")}.${fileFormat}`;
  return { fileName, blob };
}

import { format, parseISO } from "date-fns";
import { writeCsv } from "@/lib/export/csv";
import { writePdf } from "@/lib/export/pdf";
import type { ExportCell, ExportColumn, ExportTable, ExportTone } from "@/lib/export/table";
import { writeXlsx } from "@/lib/export/xlsx";
import type { ExportFile, ExportFormat, MeetingListItem, MeetingStatus } from "@/types";
import { supabase } from "../client";
import { toMeetingListItem } from "../mappers/meeting";
import { isUuid, rows } from "./query";
import { listProjects, listTeams } from "./teams";

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

function meetingTable(
  meetings: MeetingListItem[],
  teamName: Map<string, string>,
  projectName: Map<string, string>,
): ExportTable {
  const rowsOfTable = meetings.map((m): ExportCell[] => {
    const c = m.actionCounts;
    const total = c ? c.todo + c.in_progress + c.done + c.overdue : null;
    return [
      { value: m.title },
      { value: parseISO(m.date) },
      { value: teamName.get(m.teamId) ?? null },
      { value: projectName.get(m.projectId) ?? null },
      { value: m.status, tone: statusTone[m.status] },
      { value: m.sentiment?.label ?? null },
      { value: c ? c.done : null },
      { value: total },
      { value: c ? c.overdue : null, tone: c?.overdue ? "negative" : undefined },
    ];
  });
  const exported = format(new Date(), "d MMM yyyy, HH:mm");
  const count = `${meetings.length} ${meetings.length === 1 ? "meeting" : "meetings"}`;
  const subtitle = `${count}, exported ${exported}`;
  return { title: "Meetings", subtitle, columns, rows: rowsOfTable };
}

/**
 * The meetings as a file in the asked format, newest first. The rows come from the database
 * with the counts the list shows; the file is written here, in the browser, by the writers in
 * lib/export (the heavy ones load on first use).
 */
export async function exportMeetings(
  ids: string[],
  fileFormat: ExportFormat,
): Promise<ExportFile> {
  const known = ids.filter(isUuid);
  if (known.length === 0) throw new Error("Select at least one meeting.");
  const [found, teams, projects] = await Promise.all([
    supabase()
      .from("meeting_rows")
      .select("*")
      .in("id", known)
      .order("date", { ascending: false }),
    listTeams(),
    listProjects(),
  ]);
  const meetings = rows(found).map(toMeetingListItem);
  const teamName = new Map(teams.map((t) => [t.id, t.name]));
  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const blob = await writers[fileFormat](meetingTable(meetings, teamName, projectName));
  const fileName = `meetings-${format(new Date(), "yyyy-MM-dd")}.${fileFormat}`;
  return { fileName, blob };
}

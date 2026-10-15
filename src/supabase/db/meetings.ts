import type {
  CursorPage,
  MeetingListItem,
  MeetingListQuery,
  MeetingMinListQuery,
  MeetingSortField,
  MinListItem,
  Page,
} from "@/types";
import { supabase } from "../client";
import { toMeetingListItem } from "../mappers/meeting";
import {
  check,
  containsPattern,
  cursorStart,
  dayRangeBounds,
  isUuid,
  pageRange,
  rows,
  toCursorPage,
} from "./query";

// The column of meeting_rows each sort orders by. "tasks" is the open items the view counts.
const sortColumn: Record<MeetingSortField, string> = {
  title: "title",
  date: "date",
  sentiment: "sentiment_score",
  tasks: "open_count",
};

/**
 * One page of meetings, filtered, counted and sorted by the database: missing values last in
 * both directions, ties newest first and then by id, so a page never shifts between requests.
 */
export async function listMeetings(query: MeetingListQuery): Promise<Page<MeetingListItem>> {
  const { filter, sort } = query;
  let request = supabase().from("meeting_rows").select("*", { count: "exact" });

  if (filter.projectId) request = request.eq("project_id", filter.projectId);
  if (filter.teamId) request = request.eq("team_id", filter.teamId);
  if (filter.status) request = request.eq("status", filter.status);
  if (filter.sentiment) request = request.eq("sentiment_label", filter.sentiment);
  if (filter.personId) request = request.contains("participant_ids", [filter.personId]);
  if (filter.overdue) request = request.gt("overdue_count", 0);
  if (filter.q?.trim()) request = request.ilike("search_text", containsPattern(filter.q));
  if (filter.date) {
    const { from, before } = dayRangeBounds(filter.date);
    if (from) request = request.gte("date", from);
    if (before) request = request.lt("date", before);
  }

  const ascending = sort.direction === "asc";
  const [from, to] = pageRange(query.page, query.pageSize);
  const result = await request
    .order(sortColumn[sort.field], { ascending, nullsFirst: false })
    .order("date", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);
  const found = rows(result);
  return { items: found.map(toMeetingListItem), total: result.count ?? 0 };
}

/**
 * By URL input: an id that is not a meeting's gives undefined and the view shows its
 * not-found state. The action counts come with it, as on the list.
 */
export async function getMeeting(id: string): Promise<MeetingListItem | undefined> {
  if (!isUuid(id)) return undefined;
  const row = check(
    await supabase().from("meeting_rows").select("*").eq("id", id).maybeSingle(),
  );
  return row ? toMeetingListItem(row) : undefined;
}

/**
 * The choices of a meeting select: meetings whose title holds `q`, newest first, `limit` at a
 * time, as id and title; with `status`, only meetings in it.
 */
export async function meetingMinList(
  query: MeetingMinListQuery,
): Promise<CursorPage<MinListItem>> {
  let request = supabase().from("meetings").select("id, title");
  if (query.status) request = request.eq("status", query.status);
  if (query.q?.trim()) request = request.ilike("title", containsPattern(query.q));
  const start = cursorStart(query.cursor);
  const found = rows(
    await request
      .order("date", { ascending: false })
      .order("id", { ascending: true })
      .range(start, start + query.limit),
  );
  const items = found.map(({ id, title }) => ({ id, name: title }));
  return toCursorPage(items, query.cursor, query.limit);
}

/**
 * Removes the meetings and everything that belongs to them: the database cascades to their
 * people, transcript, decisions, risks, insights and action items, and their files leave
 * Storage. Unknown ids are skipped.
 */
export async function deleteMeetings(ids: string[]): Promise<void> {
  const known = ids.filter(isUuid);
  if (known.length === 0) return;
  const files = rows(
    await supabase().from("meetings").select("source_path").in("id", known),
  ).flatMap((meeting) => (meeting.source_path ? [meeting.source_path] : []));
  check(await supabase().from("meetings").delete().in("id", known));
  // The rows are gone first: a file left behind is only space, a row without its file is broken.
  if (files.length) await supabase().storage.from("meeting-files").remove(files);
}

/** Moves the meetings to a project, and so to its team. An unknown project is refused. */
export async function moveMeetings(ids: string[], projectId: string): Promise<void> {
  const known = ids.filter(isUuid);
  if (known.length === 0) return;
  const { error } = await supabase()
    .from("meetings")
    .update({ project_id: projectId })
    .in("id", known);
  // 23503: the project does not exist; 22P02: the id is not even a uuid.
  if (error?.code === "23503" || error?.code === "22P02") {
    throw new Error("That project no longer exists.");
  }
  if (error) throw new Error(error.message);
}

/**
 * Sets the failed and the stalled meetings among `ids` processing again; returns their ids, for
 * api/process to start each.
 */
export async function retryProcessing(ids: string[]): Promise<string[]> {
  const known = ids.filter(isUuid);
  if (known.length === 0) return [];
  return rows(await supabase().rpc("retry_processing", { p_ids: known }));
}

import {
  MEETING_SORT_FIELDS,
  MEETING_STATUSES,
  SENTIMENT_LABELS,
  type ListSort,
  type MeetingFilter,
  type MeetingListQuery,
  type MeetingSortField,
  type Project,
} from "@/types";
import { MEETING_PAGE_SIZES } from "../meetings.constants";
import {
  formatSortParam,
  isSameSort,
  parseChoiceParam,
  parsePageParam,
  parsePageSizeParam,
  parseSortParam,
} from "@/utils/list-params";
import { parseDayRangeParams, writeDayRangeParams } from "@/utils/day-range";

// The URL is the source of truth for the meeting list:
// /meetings?project=p_mobile&team=t_eng&q=x&status=ready&sentiment=positive&person=per_amira
//   &from=2026-10-01&to=2026-10-09&overdue=1&sort=title-asc&page=2&size=20

// Newest first, ten a page. Defaults stay out of the URL.
const DEFAULT_SORT: ListSort<MeetingSortField> = { field: "date", direction: "desc" };
const DEFAULT_PAGE_SIZE = 10;

function readParam(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

/** Empty or unknown choices are dropped; an unknown id simply matches nothing. */
function parseMeetingFilter(params: URLSearchParams): MeetingFilter {
  return {
    projectId: readParam(params, "project"),
    teamId: readParam(params, "team"),
    q: readParam(params, "q"),
    status: parseChoiceParam(params.get("status"), MEETING_STATUSES),
    sentiment: parseChoiceParam(params.get("sentiment"), SENTIMENT_LABELS),
    personId: readParam(params, "person"),
    date: parseDayRangeParams(params),
    overdue: params.get("overdue") === "1" || undefined,
  };
}

/** Never throws: anything unknown in the sort or the page gives the default. */
export function parseMeetingQuery(params: URLSearchParams): MeetingListQuery {
  return {
    filter: parseMeetingFilter(params),
    sort: parseSortParam(params.get("sort"), MEETING_SORT_FIELDS) ?? DEFAULT_SORT,
    page: parsePageParam(params.get("page")) ?? 1,
    pageSize: parsePageSizeParam(params.get("size"), MEETING_PAGE_SIZES) ?? DEFAULT_PAGE_SIZE,
  };
}

/** Writes only the set filters and what differs from the defaults. Returns "" or "?…". */
export function meetingQueryToSearch(query: MeetingListQuery): string {
  const { filter, sort, page, pageSize } = query;
  const params = new URLSearchParams();
  if (filter.projectId) params.set("project", filter.projectId);
  if (filter.teamId) params.set("team", filter.teamId);
  if (filter.q) params.set("q", filter.q);
  if (filter.status) params.set("status", filter.status);
  if (filter.sentiment) params.set("sentiment", filter.sentiment);
  if (filter.personId) params.set("person", filter.personId);
  writeDayRangeParams(params, filter.date);
  if (filter.overdue) params.set("overdue", "1");
  if (!isSameSort(sort, DEFAULT_SORT)) params.set("sort", formatSortParam(sort));
  if (page !== 1) params.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) params.set("size", String(pageSize));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** The filters that live in the side panel rather than the toolbar. */
export const SIDE_FILTER_KEYS = ["status", "sentiment", "personId", "date", "overdue"] as const;

export function hasActiveFilter(filter: MeetingFilter): boolean {
  return Object.values(filter).some(Boolean);
}

export function countSideFilters(filter: MeetingFilter): number {
  return SIDE_FILTER_KEYS.filter((key) => filter[key]).length;
}

/** Applies a change and drops a project that no longer belongs to the chosen team. */
export function patchFilter(
  current: MeetingFilter,
  patch: Partial<MeetingFilter>,
  projects: Project[],
): MeetingFilter {
  const next = { ...current, ...patch };
  const project = projects.find((p) => p.id === next.projectId);
  if (next.teamId && project && project.teamId !== next.teamId) next.projectId = undefined;
  return next;
}

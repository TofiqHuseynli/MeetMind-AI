import {
  ACTION_ITEM_SORT_FIELDS,
  ACTION_STATUSES,
  PRIORITIES,
  type ActionItemFilter,
  type ActionItemListQuery,
  type ActionItemSortField,
  type ListSort,
  type Project,
} from "@/types";
import {
  ACTION_ITEM_PAGE_SIZES,
  ACTION_ITEM_VIEWS,
  type ActionItemView,
} from "../action-items.constants";
import { parseDayRangeParams, writeDayRangeParams } from "@/utils/day-range";
import {
  formatSortParam,
  isSameSort,
  parseChoiceParam,
  parsePageParam,
  parsePageSizeParam,
  parseSortParam,
} from "@/utils/list-params";

// An action item table keeps its query in the URL beside the page's own params:
// /meetings/mtg_x?tab=action-items&q=beta&status=todo&priority=high&owner=per_amira
//   &sort=title-asc&page=2&size=20
// /action-items?team=t_eng&project=p_mobile&status=todo
// /action-items?view=board&owner=per_amira&due_from=2026-10-12&due_to=2026-10-18

// Newest first, ten a page. Defaults stay out of the URL.
const DEFAULT_SORT: ListSort<ActionItemSortField> = { field: "createdAt", direction: "desc" };
const DEFAULT_PAGE_SIZE = 10;
const QUERY_PARAMS = [
  "q", "status", "priority", "owner", "team", "project", "sort", "page", "size",
  "created_from", "created_to", "due_from", "due_to",
];
// Two date ranges share the list, so each is named by its field. Plain `from` and `to` stay
// free for the meeting page's transcript range.
const CREATED_PREFIX = "created_";
const DUE_PREFIX = "due_";

/** Never throws: anything unknown gives the default. */
export function parseActionItemQuery(params: URLSearchParams): ActionItemListQuery {
  return {
    filter: {
      q: params.get("q")?.trim() || undefined,
      status: parseChoiceParam(params.get("status"), ACTION_STATUSES),
      priority: parseChoiceParam(params.get("priority"), PRIORITIES),
      ownerId: params.get("owner")?.trim() || undefined,
      teamId: params.get("team")?.trim() || undefined,
      projectId: params.get("project")?.trim() || undefined,
      created: parseDayRangeParams(params, CREATED_PREFIX),
      due: parseDayRangeParams(params, DUE_PREFIX),
    },
    sort: parseSortParam(params.get("sort"), ACTION_ITEM_SORT_FIELDS) ?? DEFAULT_SORT,
    page: parsePageParam(params.get("page")) ?? 1,
    pageSize:
      parsePageSizeParam(params.get("size"), ACTION_ITEM_PAGE_SIZES) ?? DEFAULT_PAGE_SIZE,
  };
}

/**
 * The URL's params with the table's query written in: only the set filters and what differs
 * from the defaults. Every other param (the page's tab) stays.
 */
export function withActionItemQuery(
  params: URLSearchParams,
  query: ActionItemListQuery,
): URLSearchParams {
  const { filter, sort, page, pageSize } = query;
  const next = new URLSearchParams(params);
  QUERY_PARAMS.forEach((key) => next.delete(key));
  if (filter.q) next.set("q", filter.q);
  if (filter.status) next.set("status", filter.status);
  if (filter.priority) next.set("priority", filter.priority);
  if (filter.ownerId) next.set("owner", filter.ownerId);
  if (filter.teamId) next.set("team", filter.teamId);
  if (filter.projectId) next.set("project", filter.projectId);
  writeDayRangeParams(next, filter.created, CREATED_PREFIX);
  writeDayRangeParams(next, filter.due, DUE_PREFIX);
  if (!isSameSort(sort, DEFAULT_SORT)) next.set("sort", formatSortParam(sort));
  if (page !== 1) next.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) next.set("size", String(pageSize));
  return next;
}

const DEFAULT_VIEW: ActionItemView = ACTION_ITEM_VIEWS[0];

/** Which view the action items page shows, `?view=board`; the table by default. */
export function parseActionItemView(params: URLSearchParams): ActionItemView {
  return parseChoiceParam(params.get("view"), ACTION_ITEM_VIEWS) ?? DEFAULT_VIEW;
}

/** The URL's params with the view written in; the default stays out. Every other param stays. */
export function withActionItemView(
  params: URLSearchParams,
  view: ActionItemView,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (view === DEFAULT_VIEW) next.delete("view");
  else next.set("view", view);
  return next;
}

/** The filters that live in the side panel rather than the toolbar. */
export const ACTION_ITEM_SIDE_FILTER_KEYS = [
  "priority",
  "ownerId",
  "teamId",
  "projectId",
  "due",
] as const;

export function hasActionItemFilter(filter: ActionItemFilter): boolean {
  return Object.values(filter).some(Boolean);
}

export function countActionItemSideFilters(filter: ActionItemFilter): number {
  return ACTION_ITEM_SIDE_FILTER_KEYS.filter((key) => filter[key]).length;
}

/** Applies a change and drops a project that no longer belongs to the chosen team. */
export function patchActionItemFilter(
  current: ActionItemFilter,
  patch: Partial<ActionItemFilter>,
  projectById: Map<string, Project>,
): ActionItemFilter {
  const next = { ...current, ...patch };
  const project = next.projectId ? projectById.get(next.projectId) : undefined;
  if (next.teamId && project && project.teamId !== next.teamId) next.projectId = undefined;
  return next;
}

import {
  PERSON_SORT_FIELDS,
  type ListSort,
  type PersonListQuery,
  type PersonSortField,
} from "@/types";
import {
  formatSortParam,
  isSameSort,
  parsePageParam,
  parsePageSizeParam,
  parseSortParam,
} from "@/utils/list-params";
import { PEOPLE_PAGE_SIZES } from "../people.constants";

// The people table keeps its query in the URL: /people?q=amira&sort=meetings-desc&page=2&size=20

// By name, twenty a page. Defaults stay out of the URL.
const DEFAULT_SORT: ListSort<PersonSortField> = { field: "name", direction: "asc" };
const DEFAULT_PAGE_SIZE = 20;

/** Never throws: anything unknown gives the default. */
export function parsePeopleQuery(params: URLSearchParams): PersonListQuery {
  return {
    filter: { q: params.get("q")?.trim() || undefined },
    sort: parseSortParam(params.get("sort"), PERSON_SORT_FIELDS) ?? DEFAULT_SORT,
    page: parsePageParam(params.get("page")) ?? 1,
    pageSize: parsePageSizeParam(params.get("size"), PEOPLE_PAGE_SIZES) ?? DEFAULT_PAGE_SIZE,
  };
}

export function peopleQueryToSearch(query: PersonListQuery): string {
  const params = new URLSearchParams();
  if (query.filter.q) params.set("q", query.filter.q);
  if (!isSameSort(query.sort, DEFAULT_SORT)) params.set("sort", formatSortParam(query.sort));
  if (query.page !== 1) params.set("page", String(query.page));
  if (query.pageSize !== DEFAULT_PAGE_SIZE) params.set("size", String(query.pageSize));
  const search = params.toString();
  return search ? `?${search}` : "";
}

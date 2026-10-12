import { parseChoiceParam } from "@/utils/list-params";
import { MEETING_TABS, type MeetingTab } from "../meetings.constants";

export function meetingPath(id: string): string {
  return `/meetings/${id}`;
}

export function parseMeetingTab(params: URLSearchParams): MeetingTab {
  return parseChoiceParam(params.get("tab"), MEETING_TABS) ?? "overview";
}

/** The query string for a tab, keeping every other param: "" or "?…". */
export function meetingTabSearch(params: URLSearchParams, tab: MeetingTab): string {
  const next = new URLSearchParams(params);
  if (tab === "overview") next.delete("tab");
  else next.set("tab", tab);
  const search = next.toString();
  return search ? `?${search}` : "";
}

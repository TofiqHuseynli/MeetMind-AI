import * as db from "@/mock/db";
import type {
  CursorPage,
  Decision,
  DecisionListItem,
  ExportFile,
  MeetingListItem,
  MeetingListQuery,
  MeetingMinListQuery,
  MinListItem,
  MinListQuery,
  Page,
  PeopleMinListQuery,
  Person,
  Project,
  ProjectMinListQuery,
  ProjectSearch,
  Team,
} from "@/types";
import {
  createDecisionSchema,
  decisionRefSchema,
  exportMeetingsSchema,
  meetingIdsSchema,
  moveMeetingsSchema,
  updateDecisionSchema,
  type CreateDecisionInput,
  type DecisionRef,
  type ExportMeetingsInput,
  type MoveMeetingsInput,
  type UpdateDecisionInput,
} from "./meetings.schema";

// Today these read the mock db. A real service replaces the bodies, nothing else.

/** One page of meetings, filtered and sorted by the service. */
export function fetchMeetings(query: MeetingListQuery): Promise<Page<MeetingListItem>> {
  return db.listMeetings(query);
}

/**
 * The meeting with its action counts, or null when there is no such meeting (a query's data
 * can't be undefined).
 */
export async function fetchMeeting(id: string): Promise<MeetingListItem | null> {
  return (await db.getMeeting(id)) ?? null;
}

/** The meeting's decisions in spoken order, each with who said it and when. */
export function fetchDecisions(meetingId: string): Promise<DecisionListItem[]> {
  return db.listDecisions(meetingId);
}

export function fetchTeams(): Promise<Team[]> {
  return db.listTeams();
}

export function fetchProjects(): Promise<Project[]> {
  return db.listProjects();
}

/** Projects by name, a batch at a time, for pickers that scroll through many. */
export function searchProjects(search: ProjectSearch): Promise<CursorPage<Project>> {
  return db.searchProjects(search);
}

// The min lists feed the searched selects: id and name only, a batch at a time.

export function fetchMeetingMinList(
  query: MeetingMinListQuery,
): Promise<CursorPage<MinListItem>> {
  return db.meetingMinList(query);
}

export function fetchTeamMinList(query: MinListQuery): Promise<CursorPage<MinListItem>> {
  return db.teamMinList(query);
}

export function fetchProjectMinList(
  query: ProjectMinListQuery,
): Promise<CursorPage<MinListItem>> {
  return db.projectMinList(query);
}

export function fetchPeopleMinList(query: PeopleMinListQuery): Promise<CursorPage<MinListItem>> {
  return db.peopleMinList(query);
}

export function fetchPeople(): Promise<Person[]> {
  return db.listPeople();
}

export async function deleteMeetings(ids: string[]): Promise<void> {
  return db.deleteMeetings(meetingIdsSchema.parse(ids));
}

export async function moveMeetings(input: MoveMeetingsInput): Promise<void> {
  const { ids, projectId } = moveMeetingsSchema.parse(input);
  return db.moveMeetings(ids, projectId);
}

/** Returns how many of the meetings were failed and started again. */
export async function retryMeetingProcessing(ids: string[]): Promise<number> {
  return db.retryProcessing(meetingIdsSchema.parse(ids));
}

/** The selected meetings as a CSV, Excel or PDF file, ready to save. */
export async function exportMeetings(input: ExportMeetingsInput): Promise<ExportFile> {
  const { ids, format } = exportMeetingsSchema.parse(input);
  return db.exportMeetings(ids, format);
}

export async function createDecision(input: CreateDecisionInput): Promise<Decision> {
  return db.createDecision(createDecisionSchema.parse(input));
}

export async function updateDecision(input: UpdateDecisionInput): Promise<Decision> {
  const { id, text } = updateDecisionSchema.parse(input);
  return db.updateDecision(id, { text });
}

export function deleteDecision(input: DecisionRef): Promise<void> {
  const { id } = decisionRefSchema.parse(input);
  return db.deleteDecision(id);
}

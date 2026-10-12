// The mock service: one file per kind of data, and this list of what api.ts may call.
// Only features/*/<feature>.api.ts imports the db, and only through this file.

export {
  createActionItem,
  deleteActionItem,
  listActionBoardColumn,
  listActionItemPage,
  listMeetingActionItems,
  moveActionItem,
  updateActionItem,
} from "./action-items";
export { getDashboardStatistics } from "./dashboard";
export {
  createDecision,
  deleteDecision,
  listDecisions,
  listInsights,
  listRisks,
  updateDecision,
} from "./insights";
export {
  deleteMeetings,
  getMeeting,
  listMeetings,
  meetingMinList,
  moveMeetings,
  retryProcessing,
} from "./meetings";
export { exportMeetings } from "./meetings-export";
export { resetDb } from "./store";
export { dismissSuggestedTask, draftTask } from "./suggestions";
export {
  listPeople,
  listProjects,
  listTeams,
  peopleMinList,
  projectMinList,
  searchProjects,
  teamMinList,
} from "./teams";
export {
  getTimeline,
  listChapters,
  listTranscriptLinks,
  listTranscriptPage,
  searchTranscript,
} from "./transcript";
export { createUpload } from "./uploads";

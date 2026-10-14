// The mock service, shrinking task by task as Supabase takes over (plans/02-live.md). What is
// left: the upload and its analysis (Tasks 23-24) and "Write with AI" (Task 26).
// Only features/*/<feature>.api.ts imports the db, and only through this file.

export { resetDb } from "./store";
export { draftTask } from "./suggestions";
export { listProjects } from "./teams";
export { createUpload } from "./uploads";

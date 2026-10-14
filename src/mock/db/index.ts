// The mock service, shrinking task by task as Supabase takes over (plans/02-live.md). What is
// left: "Write with AI" (Task 26); the rest goes with the mock in Task 27.
// Only features/*/<feature>.api.ts imports the db, and only through this file.

export { resetDb } from "./store";
export { draftTask } from "./suggestions";

# Phase 2: Live mode

A real meeting goes in as an audio or transcript file and comes out as a ready meeting on the
dashboard. Supabase holds the data and the files, Deepgram turns speech into speaker turns,
Claude writes the analysis. The mock is replaced feature by feature and deleted at the end; its
fictional content never enters the database.

Decisions (chat, 2026-10-13):

- Supabase: Postgres read and written from the browser with `supabase-js` (PostgREST, RPC, RLS),
  Storage for the uploaded files. Provisioned through the Vercel Marketplace so the env vars land
  on Vercel; the Supabase CLI holds migrations and generates the row types.
- Backend: Vercel Functions in `api/` (Node). They hold the keys (Supabase service role, Deepgram,
  Anthropic). The browser never calls Deepgram or Claude. Local dev runs them with `vercel dev`.
- Claude: `claude-opus-5-5` with structured output. The transcript is sent line by line with its
  segment ids, so every decision, task, risk and insight points at its sentence.
- Deepgram: prerecorded, diarized, with utterances. The file goes from the browser straight to
  Storage; the function hands Deepgram a signed URL and gets the result on a callback.
- The data flow does not change: component -> query hook -> `api.ts` -> `src/supabase/db/`,
  the same function names and signatures as `mock/db/index.ts`. Service logic that the mock did
  in JavaScript moves to SQL (views, RPC); what builds a file in the browser (the exports) moves
  to a shared place.
- No mock beside the real thing: there is no data source switch. Each task points its `api.ts`
  at `supabase/db/` and deletes the mock files it replaced. Until then the feature keeps
  running on the mock. The database starts with the real teams, projects and people only
  (`supabase/seed.sql`, edited by hand); meetings come from uploads.
- People are records, not users: `people` (name, role, avatar color, email), the participants
  of a meeting in `meeting_participants`, the speaker labels of a transcript in
  `meeting_speakers`. A signed-in user is linked to a person by `people.user_id`.
- Auth: Supabase Auth with email and password. Sign-up is closed: people are invited from the
  Supabase dashboard, since the app belongs to one team. Every table is readable and writable
  by the `authenticated` role only; the functions in `api/` accept a request only with a valid
  Supabase session token. Uploads and AI credits are reachable only after sign-in.
- Phase 1 Tasks 11 and 13 were done on the mock; their reads move with the others (the dashboard
  statistics in Task 19). Task 12 (mock upload, with the prepared analysis of Task 13.1) is
  replaced by Tasks 23 and 24.
- New routes, `/login` (Task 16) and `/people` (Task 22), join the route list in `CLAUDE.md`
  and `spec.md`.
- New packages: `@supabase/supabase-js`; `@anthropic-ai/sdk` and `@deepgram/sdk` for `api/`;
  `supabase` and `vercel` as dev tools. Nothing else without asking.

## Database

### Task 14: Supabase project and client
Create the project, the client in `src/supabase/client.ts` from `VITE_SUPABASE_URL` and the
publishable key, `.env.example`, the env vars on Vercel, and `supabase/` initialised by the CLI
and linked to the project. The row types and mappers need the tables, so they come in Task 15.
Files: `src/supabase/client.ts`, `.env.example`, `supabase/`
Done when: the app builds with the client and the API answers with the publishable key.

### Task 15: Schema, policies and seed
One migration with the tables (teams, projects, people, meetings, meeting_participants,
meeting_speakers, transcript_segments, chapters, decisions, risks, insights, suggested_tasks,
action_items), indexes, the views that carry what lists show (meeting rows with their action
counts, action item rows with their meeting) and the policies for the `authenticated` role (no
anon access). `supabase/seed.sql` holds the real teams, projects and people; nothing from
`src/mock/seed/` goes in. Then the generated row types and the mappers between rows (snake_case)
and `src/types/`.
Files: `supabase/migrations/`, `supabase/seed.sql`, `src/supabase/database.types.ts`,
`src/supabase/mappers/`
Done when: `supabase db push` builds the schema and the reference rows on the linked project
(`supabase db reset` locally, with Docker), and the generated types match what is committed.

## Auth

### Task 16: Sign-in
Supabase Auth with email and password: a `/login` page, a session hook on the Supabase client,
the root layout that waits for the session and sends a signed-out user to `/login` (back to the
page they wanted after), the user's name and a sign-out item in the sidebar, and the link from
the session to its `people` row (a trigger on `auth.users` links the person with the same email).
An invitation or a reset email opens `/set-password`, signed in by its link, to choose the
password. `api/` gets a helper that checks the session token on every
request. No sign-up page: invitations come from the Supabase dashboard.
Files: `src/features/auth/`, `src/routes/login.tsx`, `src/routes/root-layout.tsx`,
`src/router.tsx`, `src/components/layout/`, `api/lib/auth.ts`, `supabase/migrations/`
Done when: a signed-out visitor sees only `/login`, and after sign-in every page reads as before.

## Reads

### Task 17: Meeting reads
`listMeetings` with every filter and sort of `MeetingFilter` (overdue and the tasks sort come
from the view), `getMeeting`, the min lists, teams, projects, people and the project search.
`meetings.api.ts` reads turn to `supabase/db/`.
Files: `src/supabase/db/meetings.ts`, `src/supabase/db/teams.ts`,
`src/features/meetings/meetings.api.ts`
Done when: `/meetings` and the meeting header work from the database with every filter.

### Task 18: Transcript and insight reads
The transcript page, the search as an RPC over the whole transcript with a cursor, chapters,
the timeline, the links of a sentence, decisions in spoken order, risks and insights.
Files: `src/supabase/db/transcript.ts`, `src/supabase/db/insights.ts`,
`src/features/transcript/transcript.api.ts`, `supabase/migrations/`
Done when: the Transcript, Decisions and Overview tabs work from the database.

### Task 19: Action item reads
The table across meetings, a meeting's own items, the board column read by rank in batches,
the counts on meetings, and the dashboard statistics (`getDashboardStatistics`) as one RPC.
Files: `src/supabase/db/action-items.ts`, `src/supabase/db/dashboard.ts`,
`src/features/action-items/action-items.api.ts`, `src/features/dashboard/dashboard.api.ts`
Done when: `/action-items` table and board, the meeting's Action items tab and the dashboard read
the database.

## Writes

### Task 20: Meeting and decision writes
Delete and move meetings, retry (sets `processing` again; the pipeline picks it up from Task 24),
decision create, update and delete. The export fills the same table shape from database rows; the
writers (CSV, Excel, PDF) move out of `mock/db/export/` to `src/lib/export/`.
Files: `src/supabase/db/meetings.ts`, `src/supabase/db/insights.ts`, `src/lib/export/`
Done when: every action of the meeting table and the Decisions tab changes the database.

### Task 21: Action item writes
Create, update, delete, the status change with a board place as a `move_action_item` RPC that
sets the rank in one transaction, and dismissing a suggested task.
Files: `src/supabase/db/action-items.ts`, `supabase/migrations/`
Done when: drag and drop, inline status and the task dialogs change the database and survive a
reload.

## People

### Task 22: People
A `/people` page with the team's people as a `DataTable` (name, role, email, meetings count)
and a dialog to add, edit and delete one; a sidebar item; "New person" inside the participant
and owner pickers so a meeting can be uploaded without leaving the form. Avatar color is picked
by the service from the speaker hues.
Files: `src/features/people/`, `src/routes/people.tsx`, `src/router.tsx`,
`src/components/layout/`, `src/supabase/db/people.ts`
Done when: a person added on `/people` can be picked as a participant and as a task owner.
As built: the owner picker lists the meeting's people first, then the rest of the team, so a
task can go to someone who was not in the meeting; "New person…" at its end adds and picks
someone. The participant picker and its "New person" come with the upload form in Task 23.

## Pipeline

### Task 23: Real upload
The upload form: the file (audio or a text transcript, with a size limit), title, project, team
and the participants picked from people. The browser uploads the file to Storage, creates the
meeting as `processing` with its source and participants, calls `api/process` and moves to the
meeting page, which polls until `ready` or `failed`. Replaces Task 12.
Files: `src/features/upload/`, `src/routes/upload.tsx`, `api/process.ts`,
`supabase/migrations/` (the bucket and its policies)
Done when: a dropped file lands in Storage and a `processing` meeting page opens.

### Task 24: Analysis with Claude
`api/analyze.ts`: a text transcript is split into segments (`Name: text` lines, or paragraphs
with one unknown speaker); the segments go to Claude with their ids and the participant list;
the structured answer (summary, overall and per-segment sentiment, chapters, decisions, action
items with owner, due date and priority, risks, insights, suggested tasks) is written to the
database with participation computed from the segments, and the meeting becomes `ready`, or
`failed` with the reason. Retry runs it again.
Files: `api/analyze.ts`, `api/lib/` (Supabase admin client, the Claude call and its schema)
Done when: an uploaded transcript file becomes a ready meeting with linked items on every tab.

### Task 25: Speech to text with Deepgram
`api/transcribe.ts` sends Deepgram a signed URL of the audio with diarization and utterances
and a callback URL; `api/deepgram-callback.ts` writes the segments with their speaker labels and
starts the analysis. Claude matches the labels to the participants; a label it cannot place stays
"Speaker A" until the user names it on the meeting page ("Who is Speaker A?"), which writes
`meeting_speakers`.
Files: `api/transcribe.ts`, `api/deepgram-callback.ts`, `src/features/meetings/` (the speaker
naming), `src/features/transcript/`
Done when: an uploaded audio file becomes a ready meeting with named speakers.

### Task 26: Write with AI
`api/draft-task.ts` sends the sentence, the lines around it and the participants to Claude and
returns the task fields; replaces the mock's heuristic behind the same `draftTask` signature.
Files: `api/draft-task.ts`, `src/supabase/db/suggestions.ts`
Done when: "Write with AI" in the task dialog fills the fields from Claude.

## Close

### Task 27: Mock removed
`src/mock/` is deleted whole (seed, db, delay) and nothing imports it. Errors from Supabase and
the functions show in the same error states and toasts. README describes the services, the env
vars and how to run locally. `CLAUDE.md`, `spec.md` and the skills lose the mock rules and gain
the data layer and `api/` rules.
Files: `src/mock/`, `README.md`, `CLAUDE.md`, `plans/spec.md`, `.claude/skills/`
Done when: the deployed app runs on the real services and `src/mock/` no longer exists.

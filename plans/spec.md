# Spec

## The brief

Build a web platform that analyses an online meeting after it ends and creates action items for
the team. Concept, UI/UX and frontend are made by one developer with AI tools. React/Next.js, a
mock API is enough, and state management and component architecture must be done properly.

Features the reviewer will look for:

1. Meeting list and meeting detail.
2. Mock upload of an audio file or a transcript.
3. An AI summary section.
4. Key decisions.
5. Action items with owner, deadline and priority.
6. Speakers separated inside the transcript.
7. Search with keyword highlight.
8. Sentiment and participation indicators.
9. Moving an action item between statuses by drag and drop.
10. Filtering meetings by project and team.
11. Weekly meeting statistics and charts on the dashboard.
12. Loading, empty, error and processing states.
13. Fully responsive.

The extra challenge: clicking a sentence in the transcript opens, in a right panel, the AI
insight, decision, task and risk that belong to that part of the meeting, and the user can create
a task from there.

## Pages

| Route | Shows |
| --- | --- |
| `/` | redirects to `/dashboard` |
| `/dashboard` | this week in numbers against the week before (meetings, time in meetings, mean sentiment, new action items), meetings per day over four weeks, the weekly sentiment trend, open action items by priority with the overdue count, the five newest meetings |
| `/meetings` | the meeting table (shadcn data table): search, team and project selects, a filter panel (status, sentiment, participant, a date range with quick choices, overdue only) with chips, a column menu (Asc, Desc, Hide), a View menu, pages, a tasks column (a ring with one arc per task, overdue ones red, done of total inside), row actions (open, copy link) and checkbox selection with bulk actions (export as CSV, Excel or PDF, move to project through a searchable project picker, retry processing, delete); the participant list is searchable; filters, sort and page in the URL |
| `/meetings/:id` | a header area (breadcrumb, title, date, duration, team, project, status, participants, copy link) with tabs along its edge: Overview (AI summary, key decisions and open action items), Transcript (speakers' turns a page of lines at a time from the service, under chapter headings with a Chapters menu, a search the service runs over the whole transcript that marks every hit and moves between them, loading the part a hit is in, `?find=`; a time range filter, from and to picked from round times, that cuts the transcript, its search and its chapters to a part of the meeting, `?from=&to=`; with the insight panel), Action items (a data table: search by task or owner, status and priority selects, an owner select the service searches, sort, pages, inline status), Decisions (in spoken order, each with who said it and a link to that moment; add, edit and delete, and "Add decision" from a sentence in the insight panel), Participants (talk share bars); `?tab=` in the URL; meeting statistics above every tab (sentiment, talk strip, decisions, action items) |
| `/action-items` | every meeting's action items: a data table (search by task or owner, a status select and a created date range in the toolbar, a filter panel with priority, owner, team, project and a due date range, a Created column, sort, pages, inline status, edit, delete, the meeting as a link) and, as a second view (`?view=board`), the Kanban board (To do, In progress, Done) with the same filters but status, which its columns are: each column reads its cards by rank in batches as it scrolls, a card dragged inside or between columns lands where the drop line shows and keeps that place, "+" between cards and "Add task" under each column create a task right there, and a card's menu moves it to the top of another column; a Table / Board switch and "Add task" in the header, whose dialog asks for the meeting (a searched select of analysed meetings) and takes the owner from its participants |
| `/upload` | the upload: dropzone (MP3, M4A, WAV, OGG, WEBM, MP4 audio or a TXT, VTT, SRT transcript, up to 50 MB), title, team, project and who took part (with "New person"); the file goes to Storage, the meeting is made processing, `api/process` starts its work and the page moves to the meeting, which polls until ready or failed |
| `/login` | sign in with email and password (Phase 2); "Forgot password?" sends a reset link. Signed-out visitors land here with `?next=` and go back to that page after |
| `/set-password` | where an invitation or a reset email opens, signed in by its link: the new password twice (Phase 2) |
| `/people` | the team as a data table (name with avatar and email, role, meetings, open tasks; search, sort, pages from the service), add, edit and remove in a dialog; someone with meetings or tasks cannot be removed (Phase 2) |

The shell is a sidebar on desktop and a sheet on phones, with a top bar that carries the
sidebar toggle, search and the upload action.

## Data model

Types live in `src/types/`. Ids are strings. Dates are ISO strings.

| Type | Fields |
| --- | --- |
| `Team` | `id`, `name` |
| `Project` | `id`, `name`, `teamId` |
| `Person` | `id`, `name`, `role`, `avatar` (initials and a token color) |
| `Meeting` | `id`, `title`, `projectId`, `teamId`, `date`, `durationMin`, `participantIds`, `status` (`processing`, `ready`, `failed`), `source` (`audio` or `transcript`, file name), `summary` (paragraphs), `sentiment` (overall score and label), `participation` (per person: talk share in percent, segment count) |
| `TranscriptSegment` | `id`, `meetingId`, `speakerId`, `startSec`, `endSec`, `text`, `sentiment` |
| `Decision` | `id`, `meetingId`, `segmentId` (optional: none for a decision added by hand), `text` |
| `DecisionListItem` | a `Decision` plus its `sentence` (id, speaker, start time; null when added by hand), as the meeting's decision list gets it from the service, in spoken order with the ones added by hand last |
| `ActionItem` | `id`, `meetingId`, `segmentId` (optional), `title`, `ownerId`, `dueDate`, `priority` (`low`, `medium`, `high`), `status` (`todo`, `in_progress`, `done`), `rank` (its place on the board, lower first, set by the service), `createdAt` |
| `ActionItemPlacement` | where an item goes in its board column: `start`, `end`, or `before` / `after` a card; the service turns it into a rank (halfway between the neighbours, renumbering when the gap runs out) |
| `ActionBoardColumnQuery`, `ActionBoardColumnPage` | one board column: the filter, the status and a cursor batch in; the cards by rank, the next cursor and the column's total out |
| `Risk` | `id`, `meetingId`, `segmentId`, `text`, `severity` (`low`, `medium`, `high`) |
| `Insight` | `id`, `meetingId`, `segmentId`, `text` |
| `TranscriptChapter` | `id`, `meetingId`, `title`, `firstSegmentId`, `lastSegmentId`, `startSec`, `endSec`: a stretch of the meeting about one topic, as the analysis split it |
| `TranscriptTimeline` | `lines` (each line's `id`, `speakerId`, `startSec`, `endSec`, no text) and `durationSec`: the whole meeting's shape for the timeline strip (built, not on a page yet), sent in one reply |
| `SuggestedTask` | `id`, `meetingId`, `segmentId`, `title`, `ownerId`, `dueDate`, `priority`: a task the analysis proposes for a sentence nobody took the work on from, seeded for some sentences; making it a task or removing it takes it out. The task dialog can also have the analysis write a task from its sentence ("Write with AI") |
| `MeetingListItem` | a `Meeting` plus `actionCounts`: each item counted once as done, overdue (open, past its due day), in progress or to do; null until ready; counted by the service; and `hasTranscript`, which the list and the dashboard mark. The meeting page gets the same shape |
| `ActionItemFilter`, `ActionItemListQuery` | what an action item table asks for: `q` (task or owner), `status`, `priority`, `ownerId`, `open`, `created` and `due` (day ranges), and across meetings `projectId` and `teamId`; sorted by title, created, due date, priority or status, newest first by default |
| `ActionItemListItem` | an `ActionItem` plus its `meeting` (id, title, project, team), as the table across meetings gets it from the service |
| `ListQuery`, `Page` | what a paged list asks for (`filter`, `sort` as field and direction, `page`, `pageSize`) and gets back (`items`, `total`) |
| `MeetingUpload` | what the upload sends: `title`, `projectId` and the `file` described by `name`, `size` and `kind` (`audio` or `transcript`); the team comes with the project |
| `DashboardStatistics` | what the dashboard gets from the service in one reply: `thisWeek` and `lastWeek` (meetings, minutes, mean sentiment, action items created; a week is the seven days ending today, then the seven before), `days` (meetings on each of the last 28 days), `sentimentByWeek` (four weeks, null without an analysed meeting), `openByPriority` and `overdue` |

`segmentId` is the link the extra challenge needs: selecting a segment shows the insights,
decisions, action items and risks with that id, and "Create task" pre-fills `meetingId`,
`segmentId` and the sentence.

## Data and services

- The data is real from Phase 2 on: Supabase holds it (Postgres with row level security, a
  private Storage bucket for the files, email and password sign-in by invitation). The
  database starts with the real teams, projects and people (`supabase/seed.sql`); meetings come
  from uploads. The Phase 1 mock (fictional seed, in-memory db, simulated delays and failures)
  was removed in Task 27.
- An upload puts the file in Storage, makes the meeting `processing` with who took part, and
  calls `api/process`. A recording goes through Deepgram first; then the numbered lines go to
  the model (Gemini on its free tier, behind an adapter), the answer is checked and
  `finish_analysis` writes it all in one transaction. The meeting ends `ready`, or `failed`
  with the reason, which the meeting page shows with "Try again".
- Failures are real, not simulated: the network, a busy free tier, a file the analysis cannot
  read. Every list and section shows its error state with a retry.

## Design direction

Agreed in Task 4 and reworked on 2026-10-07 to the "v2 Light" boards of the design canvas
(dashboard, meetings table, meeting detail with tabs). Soft, light, rounded; one accent.

- Indigo is the one accent: the primary action, the active navigation item, the selected tab,
  the brand mark, "this week" in charts. Tints of it (`primary/10`) mark the active state.
  Amber only marks search hits in text.
- Six speaker hues, fixed per person, used wherever that person appears. Status, priority and
  sentiment keep a small semantic set (green, orange, red, grey).
- Manrope, one family, weights 400 to 700, tabular numerals. Body 14 px, the `h1` 26 px bold,
  dense meta 13 px. No monospace, no all-caps labels, no eyebrows.
- Radii by kind: 10 px icon buttons, 12 px buttons, inputs and nav items, 16 px cards, 20 px
  large panels, pills fully round. Cards sit on a tinted page with a 1 px border; large panels
  may carry a soft shadow, the primary button a tinted one.
- The shadcn sidebar: 240 px on desktop with icon and label per item, collapsible to an icon
  rail with tooltips from the top bar (or Cmd/Ctrl+B). Below 768 px it is a sheet that the same
  top bar button opens. The top bar carries the search box, the theme toggle and the upload
  action.
- Light and dark: the system choice by default, a toggle in the top bar overrides it and the
  choice is kept in `localStorage`. Both palettes are tokens in `src/index.css`.
- The talk strip (a thin bar of speaker-colored segments per meeting) stays the one memorable
  element on rows, on the dashboard and beside the transcript.
- Motion only in answer to an action: a segment selection, a card drop, a drawer, the sidebar
  collapse.

## Rules

- English only, shadcn/ui primitives on Radix restyled to our tokens. The full list is in the
  project rules under "Decisions already made".
- Every list and detail has loading, empty and error states with a retry. Processing meetings
  show the processing state.
- Filters, search, the sort, the page and the selected tab live in the URL.
- Lists are filtered, counted, sorted and paged by the database, never in the browser; a
  feature reaches it only through its `api.ts` and the data layer in `src/supabase/db/`. Shared pieces (the data table)
  are generic and grow by adding features, not by rewriting.

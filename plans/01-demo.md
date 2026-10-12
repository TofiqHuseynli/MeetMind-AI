# Phase 1: Demo

Every feature of the brief, with mock data, working on phone and desktop. Tasks are built in
order; the shell and its design direction (Task 4) come before any page.

## Foundation

### Task 1: Project base
Install the packages of the agreed stack, add the `@/` alias, Tailwind, `cn()`, the theme tokens,
the router with a root layout and the redirect from `/` to `/dashboard`. Remove the template
content.
Files: `src/main.tsx`, `src/router.tsx`, `src/routes/`, `src/index.css`, `src/lib/`,
`vite.config.ts`, `tsconfig.app.json`, `index.html`
Done when: `npm run build` passes and `/` lands on an empty `/dashboard` page.

### Task 2: Types and seed data
The data contract in `src/types/` and the mock content described in `spec.md`: teams, projects,
people, meetings, transcripts, decisions, action items, risks, insights.
Files: `src/types/`, `src/mock/seed/`
Done when: `npx tsc --noEmit` passes and three meetings have a full transcript with linked items.

### Task 3: Mock db and query layer
`mock/db/` with get, list, create and update over the seed, `mock/delay.ts` with the failure
share, the TanStack Query provider, and the meetings `api.ts` and `queries.ts` as the pattern.
Files: `src/mock/db/`, `src/mock/delay.ts`, `src/providers.tsx`, `src/lib/query-client.ts`,
`src/features/meetings/meetings.api.ts`, `src/features/meetings/meetings.queries.ts`
Done when: a temporary list on `/meetings` shows the seed meetings through `useMeetings()`.

## Shell

### Task 4: Design direction and shell
Agree the look with the user (fonts, accent, density), then build the sidebar, top bar, mobile
navigation, page header and the first primitives: button, badge, card, skeleton, empty state,
error state.
Files: `src/components/layout/`, `src/components/ui/`, `src/routes/root-layout.tsx`,
`src/index.css`
Done when: every route renders inside the shell on phone and desktop with its page title.

## Meetings

### Task 5: Meeting list
Cards or rows with title, project, team, date, duration, participants, status and open action
items. Project and team filters and a search box, all in the URL. Loading, empty and error states.
Files: `src/features/meetings/`, `src/routes/meetings.tsx`
Done when: filtering and searching change the URL and the list, and a filter with no match shows
the empty state.

### Task 6: Meeting detail
A header area with tabs (Overview, Action items, Decisions, Participants; the tab in the URL), the
meeting statistics (sentiment, participation, decisions, action items), AI summary, key
decisions, action items in a data table (search, filters, sort, pages from the service) with an
inline status control, participation bars. Processing and
failed meetings show their states.
Files: `src/features/meetings/`, `src/routes/meeting.tsx`
Done when: a ready meeting shows every section and a processing one shows the processing state.

### Task 7: Transcript
The Transcript tab: segments grouped by speaker with time stamps, a search box that highlights the keyword in the
text and jumps between hits, and a selected segment held in `transcript.store.ts`.
Files: `src/features/transcript/`
Done when: typing a word highlights every hit and clicking a segment selects it.

### Task 8: Insight panel and create task
The right panel (a drawer below 1280 px, where the transcript and the panel no longer fit side by
side) shows the insight, decisions, action items and risks of the selected segment. "Create task"
opens a dialog with owner, deadline and priority, pre-filled from the segment, and saves through a
mutation.
Files: `src/features/transcript/`, `src/features/action-items/`
Done when: a task created from a sentence appears in the meeting's action items and on the board.

## Action items

### Task 9: Action items table
`/action-items` as a data table across all meetings: the service filters, sorts and pages, each
row carries its meeting (title as a link) and owner. Search, status, priority, owner, team and
project filters in the URL, inline status, edit and delete, "Show in transcript". The table parts
move to `features/action-items/` and the meeting's Action items tab shares them.
Files: `src/features/action-items/`, `src/routes/action-items.tsx`
Done when: the page lists the seed's items with their meetings, and a team filter narrows them.

### Task 10: Kanban board
A second view of `/action-items` (`?view=board`): three columns, cards with owner, deadline,
priority and meeting, drag and drop with dnd-kit including keyboard, optimistic status change
with rollback, the same filters as the table.
Files: `src/features/action-items/`
Done when: a card dragged to another column keeps its new status after a reload-free navigation.

## Dashboard

### Task 11: Dashboard
This week versus last week in numbers, meetings per day for the last four weeks, sentiment
trend, open action items by priority, recent meetings.
Files: `src/features/dashboard/`, `src/routes/dashboard.tsx`
Done when: the charts reflect the seed and resize on a phone.

## Upload

### Task 12: Mock upload
Dropzone and file input, project and team choice, the processing state with steps, then a move to
the new meeting once it is ready. A failed upload shows the error with a retry.
Files: `src/features/upload/`, `src/routes/upload.tsx`
Done when: dropping any file ends on a new ready meeting page.

## Polish

### Task 13: States, responsive and README
Walk every route at 320 px and 1440 px, check loading, empty, error and processing states, fix
focus and contrast, write the README (what it is, how to run, what is mocked).
Files: `src/`, `README.md`
Done when: the user signs off the walk-through.

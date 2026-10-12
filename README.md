# Recap: Meeting Intelligence Dashboard

Recap turns an online meeting into an AI summary, key decisions and action items for the team.
You can open any sentence of the transcript and see the insight, decision, task and risk that
belong to it, then create a task from there.

This is a frontend test assignment. One developer made the concept, the UI/UX and the code with
AI tools. Everything runs in the browser on a mock API, so there is no server, database or
login.

## Run it

You need Node.js **20.19+ or 22.12+**, which Vite 8 requires. On an older Node, `npm install`
quietly skips the bundler's native binding and `npm run dev` fails with "Cannot find native
binding".

```bash
npm install
npm run dev          # http://localhost:5173, opens on /dashboard
npm run build        # type-check and production build into dist/
npm run lint         # oxlint
```

## Where each part of the brief lives

| Brief | Where to look |
| --- | --- |
| Meeting list with project and team filters | `/meetings`: search, team and project selects, a filter panel, sorting and pages |
| Meeting detail | `/meetings/:id`: Overview, Transcript, Action items, Decisions and Participants tabs |
| AI summary, key decisions | The Overview tab, and the Decisions tab (add, edit, delete) |
| Action items with owner, deadline and priority | The meeting's Action items tab and `/action-items` |
| Drag and drop between statuses | `/action-items?view=board`, a Kanban board |
| Speakers in the transcript | The Transcript tab: turns grouped by speaker, each speaker in their own colour |
| Search with keyword highlight | The transcript search marks and steps through every hit |
| Sentiment and participation | The statistics above every meeting tab, the Participants tab and the dashboard |
| Transcript sentence → right panel | Click a sentence: AI insight, decisions, tasks and risks, and "Create task" |
| Weekly statistics and charts | `/dashboard`: this week against the last, meetings per day, sentiment trend |
| Mock upload of audio or transcript | `/upload`: drop a file, pick a team and project, wait for the analysis |
| Loading, empty, error, processing states | On every list and section. The mock fails about 1 call in 12, so the retry shows up on its own |
| Responsive | From 320 px up. On phones the sidebar and the right panel open as full-width sheets |

## What is mocked

- **Data:** `src/mock/` holds the data: typed seed data for a fictional company (Lumen Labs, who
  build a messaging product called Relay) and an in-memory database. Reloading the page resets
  it.
- **Network:** every call waits 300 to 900 ms, and 8% of calls fail (`FAILURE_RATE` in
  `src/mock/delay.ts`; set it to 0 to turn failures off).
- **Upload:** the file is never read or stored, only its name, size and type. A new meeting
  starts as `processing` and becomes `ready` about 8 seconds later with a prepared analysis
  (summary, sentiment, participation, decisions and action items). "Retry processing" on a
  failed meeting works the same way. The seed's processing meeting finishes 90 seconds after
  the app opens.
- **Dates:** seed dates move with today's date, so "this week" always has meetings.

## How it is built

React 19, TypeScript, Vite 8 and React Router 8 (data mode). The UI is shadcn/ui on Radix,
styled with Tailwind 4. Server state is in TanStack Query 5, tables use TanStack Table, and the
board uses dnd-kit. Charts are recharts, and forms are react-hook-form with zod.

- **Data flow:** a component calls a hook from `<feature>.queries.ts`. The hook calls
  `<feature>.api.ts`, and only `api.ts` touches the mock db. A real backend would replace the
  bodies of the `api.ts` files and nothing else. Every form input is parsed with its zod schema
  in `api.ts` before it reaches the db.
- **The service does the service's work:** lists send `{ filter, sort, page, pageSize }` and
  get `{ items, total }` back. Counts such as open action items, and the dashboard numbers, come
  from the service, never from the browser.
- **State:** server data lives in the TanStack Query cache. Status changes and drags are
  optimistic and roll back on failure. Filters, search, sort, page, tab and view live in the URL,
  so any screen can be shared as a link. zustand keeps only UI state that several components
  share: the selected sentence, the card being dragged and the upload in progress.
- **Components:** each feature (`dashboard`, `meetings`, `transcript`, `action-items`,
  `upload`) owns its components, views, hooks, schema and utilities. Shared UI lives in
  `src/components/`: `ui/` for shadcn primitives, `common/` for our composites, `layout/` for
  the shell, and `data-table/` for the one table every list uses. Route files stay thin, and
  each page loads as its own chunk.

```
src/
  routes/        one thin file per page
  features/      dashboard, meetings, transcript, action-items, upload
  components/    ui/ (shadcn), common/, layout/, data-table/
  mock/          seed/, db/, delay.ts
  types/         the contract between the UI and the data layer
  hooks/ utils/ lib/
plans/           the brief, the build plan and progress
```

## Later

Live mode would use Supabase for meetings and files, a speech-to-text model for recordings and
a language model for the analysis. Each one plugs in by replacing the bodies of
`features/*/*.api.ts`. The API keys need a small backend, such as serverless functions.

# Recap: Meeting Intelligence Dashboard

Recap turns an online meeting into an AI summary, key decisions and action items for the team.
Upload a recording or a transcript; about half a minute later the meeting is ready. Open any
sentence of the transcript to see the insight, decision, task and risk that belong to it, and
create a task from there.

One developer made the concept, the UI/UX and the code with AI tools. It runs on real services:
Supabase (database, file storage, sign-in), Deepgram (speech to text) and Google Gemini (the
analysis), with two serverless functions on Vercel between the browser and the AI services.

**Live:** https://meet-mind-ai-five.vercel.app. Sign-up is closed: the app belongs to one team,
and people get in by invitation (see [Access](#access)).

## A five-minute tour

1. **Sign in** with the email your invitation came to. The invite link lets you set a password.
2. **Upload** (`/upload`): drop a recording (MP3, M4A, WAV, OGG, WEBM, MP4) or a transcript
   (TXT, VTT, SRT), up to 50 MB. Only the file is required: left empty, the AI names the
   meeting, it goes to the Inbox project, and the speakers are found by the names said in the
   meeting (a new name is added to People; a voice with no name stays Person 1). A text
   transcript reads best as `Name: what they said` lines.
3. **The meeting** opens at once in its processing state and updates on its own, in about half
   a minute. The Overview has the AI summary, the key decisions and the open action items, under
   the meeting's sentiment and talk strip.
4. **Transcript tab**: search for a word to see every hit marked and step through them. **Click
   any sentence**: the right panel shows its AI insight, decision, task and risk. Create a task
   from there, take a suggested one, or let **Write with AI** fill the task from the sentence. A
   voice the analysis could not place asks **"Who is Person 1?"** above the transcript.
5. **Meetings** (`/meetings`): filter by team and project, open the filter panel for status,
   sentiment, a participant or dates, and sort by any column. The URL keeps it all, so a copied
   link opens the same view.
6. **Action items** (`/action-items`): switch to **Board** and drag a card from To do to Done.
7. **People** (`/people`): the team, with their meetings and open tasks. A task can go to anyone
   on it, and "New person…" adds someone from inside the task and upload forms.
8. **Dashboard** (`/dashboard`): the last seven days against the seven before, meetings per
   day for four weeks and the weekly sentiment trend.
9. **Phone and dark mode**: narrow the window to 320 px and use the theme toggle in the top bar.

## How a meeting is analysed

```
browser ── file ──► Supabase Storage (private bucket)
   │ create_upload: the meeting, processing, with who took part
   └── POST /api/process ──► Vercel Function (checks the session)
                               ├─ a recording: Deepgram Nova-3 → speaker turns
                               ├─ a transcript: read as lines (TXT, VTT, SRT)
                               ├─ Gemini: summary, mood, chapters, decisions, tasks,
                               │  risks, insights, suggested tasks, who each voice is
                               ├─ every line number, owner and day checked
                               └─ finish_analysis: all of it in one transaction → ready
meeting page ── polls ──► ready, or failed with the reason and "Try again"
```

- The model gets the transcript as numbered lines and points back by number, so every item is
  tied to the sentence it came from. Numbers that do not exist are dropped; an owner who did not
  take part becomes the person who said the line.
- The free tier of Gemini is slow or overloaded at times, so three models are tried in turn.
  "Write with AI" is a short job somebody waits on, so it takes the light model first (about
  three seconds).
- The model sits behind one adapter (`api/_lib/llm/`), picked by `LLM_PROVIDER`; another
  provider plugs in there without touching the analysis.

## Access

The app is for one team, so sign-up is off. To let someone in, add them on `/people` with their
email, then invite that email from the Supabase dashboard (Authentication → Users → Invite
user). Signing in links their account to that person, so the sidebar shows their name.

## Run it locally

You need Node.js **20.19+ or 22.12+**, which Vite 8 requires.

```bash
npm install
cp .env.example .env.local   # fill in the keys (see below)
npx vercel dev               # the app and the functions in api/, on http://localhost:3000
npm run dev                  # the app alone on :5173 (uploads cannot start their analysis)
npm run build                # type-check and production build
npm run lint                 # oxlint
```

The database lives in `supabase/migrations/`. On a new Supabase project:

```bash
npx supabase login && npx supabase link
npx supabase db push --include-seed    # the schema, then the team from supabase/seed.sql
```

| Variable | Where | What |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | browser | the project and its publishable key; row level security guards the data |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | `api/` only | the server's client, which skips row level security, so every function checks the session first |
| `DEEPGRAM_API_KEY` | `api/` only | speech to text |
| `LLM_PROVIDER`, `GEMINI_API_KEY` | `api/` only | the analysis model; `GEMINI_MODEL` (a comma list) overrides the models tried |

## Security

- Every table has row level security: signed-in members read and write, nobody signed out gets
  anything. The two functions accept a request only with a valid session.
- The secret key and the AI keys live only on the server (Vercel). The browser holds the
  publishable key, which grants nothing without a session.
- Files stay in a private bucket; Deepgram reads a recording through a link that expires in ten
  minutes.
- Gemini's free tier may use what it is sent to improve Google's products. Use it for test and
  demo meetings; for real ones, switch to a paid key or another provider.

## Concept

After a call, the team needs three things: what was decided, who does what by when, and how
the meeting went. Recap puts those first, with the summary, decisions and action items on the
meeting's front page. The transcript is the evidence behind them. Every insight, decision, task
and risk points at the sentence it came from, so a click on a sentence answers "why is this
here?" and turns a remark nobody owned into a task.

Action items from every meeting meet on one board, because that is where the work happens
after the call. The dashboard answers the manager's question: are we meeting more or less this
week, and how is the mood?

## Design decisions

- **Soft and light, one accent:** soft, light and rounded, with indigo as the only accent. It
  marks the main action, the active item and "this week" in charts. Amber marks only search
  hits, so they are never mistaken for anything else.
- **People keep their colour:** each person has one of six hues on their avatar, their
  transcript turns, the talk strip and the participation bars, so you can follow a voice
  across the page.
- **The talk strip:** a thin bar of speaker colours that shows who spoke how much at a glance.
  It appears on every meeting row, on the dashboard and above every meeting tab.
- **Small, fixed meaning colours:** status, priority and sentiment use green, orange, red and
  grey, and always come with text, never colour alone.
- **One typeface:** Manrope in four weights, with tabular numbers so figures line up.
- **Motion only after an action:** a selection, a drop or a drawer. Nothing moves on page
  load.
- **Mobile first:** the sidebar and the insight panel become full-width sheets on phones, and
  tables scroll sideways rather than drop columns.

## How it is built

React 19, TypeScript, Vite 8 and React Router 8 (data mode). The UI is shadcn/ui on Radix,
styled with Tailwind 4. Server state is in TanStack Query 5, tables use TanStack Table, and the
board uses dnd-kit. Charts are recharts, and forms are react-hook-form with zod. The data is
Supabase (Postgres, Storage, Auth); the AI work runs in Vercel Functions.

- **Data flow:** a component calls a hook from `<feature>.queries.ts`. The hook calls
  `<feature>.api.ts`, which parses its input with the feature's zod schema and calls the data
  layer in `src/supabase/db/`. Only the data layer talks to Supabase; mappers turn its rows
  into the types in `src/types/`.
- **The database does the service's work:** lists send `{ filter, sort, page, pageSize }` and
  get `{ items, total }` back. Filters, sorts and counts (open action items, the dashboard
  numbers) run in SQL views and functions; writes that must hold together (a card's board
  place, an upload, an analysis) are single transactions.
- **State:** server data lives in the TanStack Query cache. Status changes and drags are
  optimistic and roll back on failure. Filters, search, sort, page, tab and view live in the
  URL, so any screen can be shared as a link. zustand keeps only UI state several components
  share: the session, the selected sentence and the card being dragged.
- **Components:** each feature (`dashboard`, `meetings`, `transcript`, `action-items`,
  `upload`, `people`, `auth`) owns its components, views, hooks, schema and utilities. Shared UI
  lives in `src/components/`: `ui/` for shadcn primitives, `common/` for our composites,
  `layout/` for the shell, and `data-table/` for the one table every list uses. Route files stay
  thin, and each page loads as its own chunk.

```
src/
  routes/        one thin file per page
  features/      dashboard, meetings, transcript, action-items, upload, people, auth
  components/    ui/ (shadcn), common/, layout/, data-table/
  supabase/      client, db/ (the data layer), mappers/, generated row types
  types/         the contract between the UI and the data layer
  hooks/ utils/ lib/
api/             process (upload to ready meeting), draft-task (Write with AI); helpers in _lib/
supabase/        migrations/, seed.sql, config.toml
plans/           the brief, the build plans and progress
```

## Made with AI tools

The concept, the design direction and the code were made with an AI coding assistant, step
by step:

- **`plans/`:** holds the brief, the agreed spec (pages, data model, design direction), the
  phase plans and a TODO. Each task has a "done when" line and was built only after approval;
  where the work changed a plan, an "As built" line says how.
- **Written rules:** the rules the assistant follows, kept as files outside this repository:
  where a file goes, how a query or a form is written, how colours and states are handled, how
  a task starts and ends, and the decisions that do not change (the data flow, URL state, the
  folder layout). They keep the code consistent across sessions.
- **shadcn components:** added through the shadcn MCP server, so they come from the registry
  as written.
- **Checks:** every task ended with lint, a type-check and a build, and the data layer and the
  functions were tested against the real database as a signed-in test user. Layouts were
  checked by eye on a phone and a desktop.

## Where each part of the brief lives

| Brief | Where to look |
| --- | --- |
| Meeting list with project and team filters | `/meetings`: search, team and project selects, a filter panel, sorting and pages |
| Meeting detail | `/meetings/:id`: Overview, Transcript, Action items, Decisions and Participants tabs |
| AI summary, key decisions | The Overview tab, and the Decisions tab (add, edit, delete) |
| Action items with owner, deadline and priority | The meeting's Action items tab and `/action-items` |
| Drag and drop between statuses | `/action-items?view=board`, a Kanban board |
| Speakers in the transcript | The Transcript tab: turns grouped by speaker, each in their own colour; "Who is Person 1?" names a voice |
| Search with keyword highlight | The transcript search marks and steps through every hit |
| Sentiment and participation | The statistics above every meeting tab, the Participants tab and the dashboard |
| Transcript sentence → right panel | Click a sentence: AI insight, decisions, tasks and risks, "Create task" and "Write with AI" |
| Weekly statistics and charts | `/dashboard`: this week against the last, meetings per day, sentiment trend |
| Upload of audio or transcript | `/upload`: the file goes to Storage and is analysed by Deepgram and Gemini |
| Loading, empty, error, processing states | On every list and section; a failed analysis shows its reason and "Try again" |
| Responsive | From 320 px up. On phones the sidebar and the right panel open as full-width sheets |

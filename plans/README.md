# Plans

Meeting Intelligence Dashboard, a frontend test assignment built mock-first, then live. The
brief, the pages, the data model and the rules are in `spec.md`. Progress is in `TODO.md`.

| Phase | File | Goal |
| --- | --- | --- |
| 1 | `01-demo.md` | Every feature of the brief with mock data, on phone and desktop, ready to hand over |
| 2 | `02-live.md` | Live mode: Supabase with sign-in, real upload, speech to text and LLM analysis |

## Global constraints

- Phase 1 ran on a mock in the browser (`src/mock/`, removed in Task 27). Since Phase 2 the
  data is Supabase (database, storage, auth) and the AI work runs in Vercel Functions in `api/`
  (`02-live.md`).
- Data flow: component -> query hook (`<feature>.queries.ts`) -> `<feature>.api.ts` -> the
  data layer in `src/supabase/db/`. Only the data layer talks to Supabase; the browser calls
  the AI services only through `api/`.
- The UI never does the service's work. Lists send `{ filter, sort, page, pageSize }` and get
  `{ items, total }`; counts come from the service.
  Shared UI is generic and grows by adding features (`components/data-table/`).
- Packages: the stack list in the project rules, and for Phase 2 the ones `02-live.md` names.
  Nothing else without asking.
- Interface text is English; the analysis writes in the language of the meeting.
- The design direction is agreed in Task 4 before any page is built on it.
- Lines under 100 characters, one component per file, named exports, types in `src/types/`.
- Checks: lint, type-check, build, PhpStorm inspections, and the data layer and functions run
  against the real database as a signed-in test user. No browser, no screenshots.

## File map

```
plans/
  README.md      this file
  spec.md        brief, pages, data model, design direction, rules
  01-demo.md     Phase 1 tasks
  02-live.md     Phase 2 tasks
  TODO.md        one box per task, known problems, open questions
```

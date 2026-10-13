# Plans

Meeting Intelligence Dashboard, a frontend test assignment built mock-first. The brief, the pages,
the data model and the rules are in `spec.md`. Progress is in `TODO.md`.

| Phase | File | Goal |
| --- | --- | --- |
| 1 | `01-demo.md` | Every feature of the brief with mock data, on phone and desktop |
| 1.5 | `02-delivery.md` | A reviewer sees the whole brief: transcripts on uploads, a README tour, a live link |
| 2 | no file yet | Live mode: Supabase, speech to text, LLM analysis. Only if the user asks |

## Global constraints

- Mock only. The data layer is `src/mock/` (seed, in-memory db, delay). No real server, no auth,
  no file storage, no network call.
- Data flow: component -> query hook (`<feature>.queries.ts`) -> `<feature>.api.ts` ->
  `mock/db/`. A later real service changes only `api.ts`.
- Production-ready on a mock: the UI never does the service's work. Lists send
  `{ filter, sort, page, pageSize }` and get `{ items, total }`; counts come from the service.
  Shared UI is generic and grows by adding features (`components/data-table/`).
- Packages: the stack list in the project rules. Nothing else without asking.
- Interface text and mock content are English.
- The design direction is agreed in Task 4 before any page is built on it.
- Lines under 100 characters, one component per file, named exports, types in `src/types/`.
- Checks: lint, type-check, build, PhpStorm inspections. No browser, no screenshots.

## File map

```
plans/
  README.md      this file
  spec.md        brief, pages, data model, design direction, rules
  01-demo.md     Phase 1 tasks
  02-delivery.md Phase 1.5 tasks
  TODO.md        one box per task, known problems, open questions
```

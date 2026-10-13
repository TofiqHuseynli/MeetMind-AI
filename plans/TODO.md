# TODO

## Phase 1: Demo (`01-demo.md`)

- [x] Task 1: Project base
- [x] Task 2: Types and seed data
- [x] Task 3: Mock db and query layer
- [x] Task 4: Design direction and shell
- [x] Task 5: Meeting list
- [x] Task 6: Meeting detail
- [x] Task 7: Transcript
- [x] Task 8: Insight panel and create task
- [x] Task 9: Action items table
- [x] Task 10: Kanban board
- [x] Task 11: Dashboard
- [x] Task 12: Mock upload
- [x] Task 13: States, responsive and README

## Phase 2: Live mode

- [ ] Write the plan, only when the user asks

## Known problems

- None open.

## Open questions

- Long transcripts (1000 lines and more), one step at a time with the user's yes: 1. paging from the
  service with "Show more" (done), 2. search on the service with a list of hits (done), 3. chapters
  (done), 4. a time range filter (done), 5. a virtual list (`@tanstack/react-virtual`, outside
  the stack: ask before adding it).

- The timeline strip (the whole meeting as a thin bar with decision and risk ticks, the part on
  screen framed, a click moves there, grips pick a time range) is built in
  `transcript-tab/timeline/` but not on the page: the header got too tall. Kept for a later
  place, such as a row of its own or the Overview tab.

- Sidebar counts (meetings, open action items) and the "Processing 1 meeting" card from the v2
  boards: a small follow-up after Task 10, when the action item hooks exist.

- Saving the mock db to `localStorage` with a "Reset demo data" action: after Phase 1, if wanted.

- More row actions on the meeting table (rename, "Open transcript", which links to
  `?tab=transcript`): each needs its mutation or route first. Not in
  the brief.
- The seed has four projects, so the project picker never needs a second batch; its infinite
  scroll shows only with more projects (or a smaller batch size).

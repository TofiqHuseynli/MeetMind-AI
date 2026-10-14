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
- [x] Task 12: Mock upload (done on the mock; Task 23 replaces it in Phase 2)
- [x] Task 13: States, responsive and README
- [x] Task 13.1: Uploads come with a transcript
- [x] Task 13.2: The way in for a reviewer
- [x] Task 13.3: Live demo
- [x] Task 13.4: Final review

## Phase 2: Live mode (`02-live.md`)

- [x] Task 14: Supabase project and client (the env vars on Vercel wait for the Vercel project)
- [x] Task 15: Schema, policies and seed
- [x] Task 16: Sign-in
- [x] Task 17: Meeting reads
- [x] Task 18: Transcript and insight reads
- [x] Task 19: Action item reads
- [x] Task 20: Meeting and decision writes
- [x] Task 21: Action item writes
- [x] Task 22: People
- [ ] Task 23: Real upload
- [ ] Task 24: Analysis with Claude
- [ ] Task 25: Speech to text with Deepgram
- [ ] Task 26: Write with AI
- [ ] Task 27: Mock removed

## Known problems

- Since sign-in, supabase-js shares a chunk with zod (`schemas-*.js`, about 490 kB before gzip)
  that every page loads, and the build warns again about chunks over 500 kB. A separate vendor
  chunk for supabase-js (rolldown `advancedChunks`) would split it.
- Until Task 23 the upload still goes to the mock db, so its new meeting is not in the database
  and its page says the upload is gone. Until Task 24 a retried meeting stays processing. Until
  Task 26 "Write with AI" cannot find a database sentence and shows its error.

## Open questions

- Phase 2 model: `claude-opus-5-5` is the plan; `claude-sonnet-5-5` cuts the cost of an analysis
  by about half if quality holds. Decide in Task 24 after the first real meetings.
- Teams and projects have no page of their own yet: they are edited in `supabase/seed.sql` or
  the Supabase dashboard. A small settings page can follow Task 22 if the team needs it.

- Long transcripts (1000 lines and more), one step at a time with the user's yes: 1. paging from the
  service with "Show more" (done), 2. search on the service with a list of hits (done), 3. chapters
  (done), 4. a time range filter (done), 5. a virtual list (`@tanstack/react-virtual`, outside
  the stack: ask before adding it).

- The timeline strip (the whole meeting as a thin bar with decision and risk ticks, the part on
  screen framed, a click moves there, grips pick a time range) is built in
  `transcript-tab/timeline/` but not on the page: the header got too tall. Kept for a later
  place, such as a row of its own or the Overview tab.

- Sidebar counts (meetings, open action items) and the "Processing 1 meeting" card from the v2
  boards: a small follow-up, now that the action item hooks exist.

- More row actions on the meeting table (rename, "Open transcript", which links to
  `?tab=transcript`): each needs its mutation or route first. Not in
  the brief.
- The seed has four projects, so the project picker never needs a second batch; its infinite
  scroll shows only with more projects (or a smaller batch size).

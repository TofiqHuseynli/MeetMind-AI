# Phase 1.5: Delivery

The brief is covered; this phase makes sure a reviewer sees all of it. A new upload must show
the extra challenge too, the README must lead the way, and the demo must open from a link.

## Demo

### Task 14: Uploads come with a transcript
The upload template carries a transcript of about thirty lines with its insights, decisions,
tasks, suggested tasks and risks tied to sentences. When the meeting is ready, its Transcript
tab and the right panel work like a seed meeting's.
Files: `src/mock/seed/analyses.ts`, `src/mock/db/processing.ts`
Done when: any uploaded file ends on a ready meeting whose sentences open the panel, and a task
can be made from there.

## Hand-over

### Task 15: The way in for a reviewer
The README gets a five-minute tour, the concept and design decisions, and how AI tools were
used. The meeting list marks the meetings that have a transcript.
Files: `README.md`, `src/features/meetings/`
Done when: the README alone leads through every point of the brief.

### Task 16: Live demo
Ready for Vercel (the SPA rewrite is in `vercel.json`): a clean build, and the steps to connect
the repository. The link goes at the top of the README once it is live.
Files: `vercel.json`, `README.md`
Done when: the build is clean and the steps are given; the link is added when the user has it.

### Task 17: Final review
A review of the whole code for bugs and needless complexity, and the fixes.
Files: `src/`
Done when: lint, type-check and build pass after the fixes, and the report lists what changed.

import type { Meeting } from "@/types";

// Dates are relative to SEED_TODAY in ./index.ts; db/store.ts shifts them on load.
export const meetings = [
  {
    id: "mtg_mobile_kickoff",
    title: "Relay Mobile 2.0 kickoff",
    projectId: "p_mobile",
    teamId: "t_eng",
    date: "2026-09-15T10:00:00.000Z",
    durationMin: 45,
    participantIds: ["per_amira", "per_jonas", "per_tomas", "per_daniel", "per_lena"],
    status: "ready",
    source: { kind: "audio", fileName: "mobile-2-0-kickoff.m4a" },
    summary: [
      "The team kicked off Relay Mobile 2.0, the rebuild of the iOS and Android apps around " +
        "shared webview packages so the message composer, search and settings ship once for " +
        "web and mobile.",
      "The beta cut is set for October 13. The first two sprints cover the shared composer " +
        "and offline drafts; push notifications depend on backend topics that are not " +
        "scheduled yet.",
    ],
    sentiment: { score: 0.45, label: "positive" },
    participation: [
      { personId: "per_jonas", talkSharePct: 32, segmentCount: 14 },
      { personId: "per_amira", talkSharePct: 24, segmentCount: 11 },
      { personId: "per_lena", talkSharePct: 18, segmentCount: 8 },
      { personId: "per_tomas", talkSharePct: 14, segmentCount: 6 },
      { personId: "per_daniel", talkSharePct: 12, segmentCount: 5 },
    ],
  },
  {
    id: "mtg_platform_incident",
    title: "Incident review: API latency spike",
    projectId: "p_platform",
    teamId: "t_eng",
    date: "2026-09-17T14:30:00.000Z",
    durationMin: 30,
    participantIds: ["per_jonas", "per_priya", "per_marcus", "per_sofia"],
    status: "ready",
    source: { kind: "transcript", fileName: "incident-2026-09-16.vtt" },
    summary: [
      "A 40-minute latency spike on September 16 was traced to the database connection pool " +
        "filling up during a bulk import for one account. No data was lost; p95 latency went " +
        "from 180 ms to 2.4 s.",
      "The pool size had no alert and the import ran without rate limiting. Both get fixed " +
        "this week, and a load test is scheduled before the next large customer onboarding.",
    ],
    sentiment: { score: -0.25, label: "negative" },
    participation: [
      { personId: "per_priya", talkSharePct: 38, segmentCount: 12 },
      { personId: "per_jonas", talkSharePct: 30, segmentCount: 10 },
      { personId: "per_sofia", talkSharePct: 18, segmentCount: 6 },
      { personId: "per_marcus", talkSharePct: 14, segmentCount: 5 },
    ],
  },
  {
    id: "mtg_billing_scope",
    title: "Billing v2 scope review",
    projectId: "p_billing",
    teamId: "t_product",
    date: "2026-09-22T09:00:00.000Z",
    durationMin: 50,
    participantIds: ["per_amira", "per_jonas", "per_priya", "per_sofia", "per_elif"],
    status: "ready",
    source: { kind: "audio", fileName: "billing-v2-scope-review.m4a" },
    summary: [
      "The team locked the scope of Billing v2: a fix for out-of-order payment webhooks, " +
        "usage-based invoicing billed in arrears with a single dimension (messages per " +
        "month), and self-serve plan upgrades. Multi-currency and self-serve downgrades move " +
        "to Q1.",
      "Support sees 41 plan-change tickets a month, two thirds of them upgrades, and the " +
        "invoice failure rate has climbed to 3.8 percent. The webhook fix ships first so the " +
        "failure rate drops while the larger work is built.",
      "Three enterprise deals wait on usage-based invoicing; a single usage dimension covers " +
        "90 percent of what they asked for.",
    ],
    sentiment: { score: 0.3, label: "positive" },
    participation: [
      { personId: "per_amira", talkSharePct: 30, segmentCount: 13 },
      { personId: "per_jonas", talkSharePct: 23, segmentCount: 10 },
      { personId: "per_elif", talkSharePct: 19, segmentCount: 8 },
      { personId: "per_priya", talkSharePct: 16, segmentCount: 7 },
      { personId: "per_sofia", talkSharePct: 12, segmentCount: 5 },
    ],
  },
  {
    id: "mtg_onboarding_research",
    title: "Onboarding research readout",
    projectId: "p_onboarding",
    teamId: "t_product",
    date: "2026-09-24T13:00:00.000Z",
    durationMin: 40,
    participantIds: ["per_amira", "per_lena", "per_elif", "per_sofia"],
    status: "ready",
    source: { kind: "audio", fileName: "onboarding-research-readout.m4a" },
    summary: [
      "Lena presented eight interviews with trial accounts that never sent a message. Six of " +
        "them stalled on connecting a channel; the empty inbox gave no next step.",
      "The redesign will open with a channel picker and a sample conversation, and the " +
        "activation metric becomes 'first message sent within 24 hours' instead of sign-ups.",
    ],
    sentiment: { score: 0.1, label: "neutral" },
    participation: [
      { personId: "per_lena", talkSharePct: 44, segmentCount: 16 },
      { personId: "per_amira", talkSharePct: 22, segmentCount: 9 },
      { personId: "per_elif", talkSharePct: 20, segmentCount: 8 },
      { personId: "per_sofia", talkSharePct: 14, segmentCount: 5 },
    ],
  },
  {
    id: "mtg_mobile_sprint",
    title: "Relay Mobile sprint 14 planning",
    projectId: "p_mobile",
    teamId: "t_eng",
    date: "2026-09-29T10:00:00.000Z",
    durationMin: 55,
    participantIds: ["per_jonas", "per_tomas", "per_daniel", "per_marcus", "per_lena"],
    status: "ready",
    source: { kind: "audio", fileName: "sprint-14-planning.m4a" },
    summary: [
      "Sprint 14 is the last full sprint before the beta cut on October 13. It takes offline " +
        "drafts with conflict handling, the shared composer package, the seven empty states " +
        "and a pass over the flaky Android end-to-end tests.",
      "Push notifications move to the sprint after beta: the backend topics do not exist yet " +
        "and the settings screen is not designed. Code freeze is October 10 and nothing " +
        "merges after it without a green test run.",
      "The plan totals seventeen engineer days against twenty days of app capacity, three " +
        "days of slack; Jonas protects the team from billing work.",
    ],
    sentiment: { score: 0.2, label: "positive" },
    participation: [
      { personId: "per_jonas", talkSharePct: 27, segmentCount: 12 },
      { personId: "per_lena", talkSharePct: 22, segmentCount: 10 },
      { personId: "per_tomas", talkSharePct: 20, segmentCount: 9 },
      { personId: "per_daniel", talkSharePct: 16, segmentCount: 7 },
      { personId: "per_marcus", talkSharePct: 15, segmentCount: 7 },
    ],
  },
  {
    id: "mtg_activation_review",
    title: "Activation metrics review",
    projectId: "p_onboarding",
    teamId: "t_product",
    date: "2026-09-30T15:00:00.000Z",
    durationMin: 35,
    participantIds: ["per_amira", "per_sofia", "per_elif"],
    status: "ready",
    source: { kind: "transcript", fileName: "activation-review.txt" },
    summary: [
      "Activation within 24 hours sits at 31 percent for September, flat against August. " +
        "Accounts that connect a channel in the first session activate at 68 percent.",
      "Elif will interview five churned trial accounts before the redesign ships, and the " +
        "weekly report gains a channel-connection funnel.",
    ],
    sentiment: { score: -0.1, label: "neutral" },
    participation: [
      { personId: "per_sofia", talkSharePct: 46, segmentCount: 14 },
      { personId: "per_amira", talkSharePct: 30, segmentCount: 9 },
      { personId: "per_elif", talkSharePct: 24, segmentCount: 7 },
    ],
  },
  {
    id: "mtg_platform_oncall",
    title: "On-call handover and reliability goals",
    projectId: "p_platform",
    teamId: "t_eng",
    date: "2026-10-01T09:30:00.000Z",
    durationMin: 25,
    participantIds: ["per_jonas", "per_priya", "per_daniel"],
    status: "ready",
    source: { kind: "audio", fileName: "oncall-handover-w40.m4a" },
    summary: [
      "A quiet week on call: two pages, both from the same noisy disk alert on the staging " +
        "cluster. Daniel takes the rotation for the beta week.",
      "The reliability goal for Q4 is p95 under 300 ms on the messages API with the " +
        "connection pool alert in place.",
    ],
    sentiment: { score: 0.35, label: "positive" },
    participation: [
      { personId: "per_jonas", talkSharePct: 40, segmentCount: 9 },
      { personId: "per_priya", talkSharePct: 35, segmentCount: 8 },
      { personId: "per_daniel", talkSharePct: 25, segmentCount: 6 },
    ],
  },
  {
    id: "mtg_design_crit",
    title: "Onboarding design critique",
    projectId: "p_onboarding",
    teamId: "t_product",
    date: "2026-10-05T11:00:00.000Z",
    durationMin: 45,
    participantIds: ["per_lena", "per_amira", "per_daniel"],
    status: "failed",
    source: { kind: "audio", fileName: "design-crit-oct-5.m4a" },
    summary: [],
    sentiment: null,
    participation: [],
  },
  {
    id: "mtg_release_readiness",
    title: "Release readiness: Relay 2.0 beta",
    projectId: "p_mobile",
    teamId: "t_product",
    date: "2026-10-06T14:00:00.000Z",
    durationMin: 40,
    participantIds: [
      "per_amira",
      "per_jonas",
      "per_marcus",
      "per_elif",
      "per_lena",
      "per_tomas",
    ],
    status: "ready",
    source: { kind: "audio", fileName: "release-readiness-beta.m4a" },
    summary: [
      "The beta to fifty accounts stays on October 14 with a go/no-go at noon on the 13th. A " +
        "miss slips the beta a week, not a day.",
      "A crash in the offline queue on older Android devices with almost no free storage is " +
        "a beta blocker; the fix lands Thursday and regression finishes Monday. The " +
        "onboarding tour is updated before freeze.",
      "Jonas is the escalation engineer for week one, the crash gate is 1 percent of " +
        "sessions for two days, and the rollback plan keeps queued drafts on the device.",
    ],
    sentiment: { score: 0.4, label: "positive" },
    participation: [
      { personId: "per_jonas", talkSharePct: 26, segmentCount: 11 },
      { personId: "per_amira", talkSharePct: 24, segmentCount: 10 },
      { personId: "per_marcus", talkSharePct: 14, segmentCount: 6 },
      { personId: "per_elif", talkSharePct: 14, segmentCount: 6 },
      { personId: "per_tomas", talkSharePct: 12, segmentCount: 5 },
      { personId: "per_lena", talkSharePct: 10, segmentCount: 4 },
    ],
  },
  {
    id: "mtg_billing_sync",
    title: "Billing v2 weekly sync",
    projectId: "p_billing",
    teamId: "t_product",
    date: "2026-10-07T09:00:00.000Z",
    durationMin: 30,
    participantIds: ["per_amira", "per_jonas", "per_priya", "per_sofia", "per_elif"],
    status: "processing",
    source: { kind: "audio", fileName: "billing-weekly-sync.m4a" },
    summary: [],
    sentiment: null,
    participation: [],
  },
] satisfies Meeting[];

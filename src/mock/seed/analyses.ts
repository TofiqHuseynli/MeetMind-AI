import type { MeetingSentiment, Participation, Priority } from "@/types";

/**
 * What the mock analysis "finds" when a meeting finishes processing: the summary, the mood,
 * who spoke, and the decisions and tasks, which carry no sentence since nothing is
 * transcribed. Due days count from the day the analysis ends.
 */
export type PreparedAnalysis = {
  summary: string[];
  sentiment: MeetingSentiment;
  participation: Participation[];
  decisions: string[];
  actionItems: { title: string; ownerId: string; dueInDays: number; priority: Priority }[];
};

/** An upload brings no people or length of its own, so its template carries them. */
export type UploadTemplate = PreparedAnalysis & {
  participantIds: string[];
  durationMin: number;
};

/** The results for the seed meetings that are processing or failed, by meeting id. */
export const meetingAnalyses: Record<string, PreparedAnalysis> = {
  mtg_billing_sync: {
    summary: [
      "Annual plans move to the new invoice engine on November 2; monthly plans follow once " +
        "a full billing cycle has run clean.",
      "Proration on mid-cycle seat changes still rounds per seat instead of per invoice. " +
        "Priya fixes it before the cutover, and finance signs off on a sample of twenty " +
        "invoices.",
    ],
    sentiment: { score: 0.2, label: "positive" },
    participation: [
      { personId: "per_priya", talkSharePct: 30, segmentCount: 12 },
      { personId: "per_amira", talkSharePct: 26, segmentCount: 10 },
      { personId: "per_sofia", talkSharePct: 18, segmentCount: 7 },
      { personId: "per_jonas", talkSharePct: 14, segmentCount: 5 },
      { personId: "per_elif", talkSharePct: 12, segmentCount: 5 },
    ],
    decisions: [
      "Annual plans move to the new invoice engine on November 2.",
      "Monthly plans wait for one clean billing cycle on the new engine.",
    ],
    actionItems: [
      {
        title: "Fix proration rounding for mid-cycle seat changes",
        ownerId: "per_priya",
        dueInDays: 6,
        priority: "high",
      },
      {
        title: "Send finance a sample of twenty invoices from staging",
        ownerId: "per_sofia",
        dueInDays: 8,
        priority: "medium",
      },
    ],
  },
  mtg_design_crit: {
    summary: [
      "The new welcome checklist tested well, but the workspace naming step loses people on " +
        "phones because the keyboard covers the continue button.",
      "The team keeps the checklist, drops the optional team invite from the first screen and " +
        "moves it to day two.",
    ],
    sentiment: { score: 0.25, label: "positive" },
    participation: [
      { personId: "per_lena", talkSharePct: 46, segmentCount: 18 },
      { personId: "per_amira", talkSharePct: 32, segmentCount: 12 },
      { personId: "per_daniel", talkSharePct: 22, segmentCount: 8 },
    ],
    decisions: ["The team invite moves from the first screen to a day-two prompt."],
    actionItems: [
      {
        title: "Keep the continue button above the keyboard on the naming step",
        ownerId: "per_daniel",
        dueInDays: 4,
        priority: "high",
      },
      {
        title: "Draft the day-two invite prompt",
        ownerId: "per_lena",
        dueInDays: 7,
        priority: "medium",
      },
    ],
  },
};

/** What every uploaded file turns into: a short planning call of the product team. */
export const uploadTemplate: UploadTemplate = {
  participantIds: ["per_amira", "per_jonas", "per_lena", "per_marcus"],
  durationMin: 35,
  summary: [
    "The team went through the open work for the next two weeks and cut the scope to what " +
      "can ship before the beta review.",
    "Saved replies in the composer go first; the analytics export waits until the data team " +
      "has the new event schema. Marcus raised that support has no runbook for the beta yet.",
  ],
  sentiment: { score: 0.3, label: "positive" },
  participation: [
    { personId: "per_amira", talkSharePct: 34, segmentCount: 13 },
    { personId: "per_jonas", talkSharePct: 28, segmentCount: 11 },
    { personId: "per_lena", talkSharePct: 20, segmentCount: 8 },
    { personId: "per_marcus", talkSharePct: 18, segmentCount: 7 },
  ],
  decisions: [
    "Saved replies ship before the beta review.",
    "The analytics export waits for the new event schema.",
  ],
  actionItems: [
    {
      title: "Write the support runbook for the beta",
      ownerId: "per_marcus",
      dueInDays: 5,
      priority: "high",
    },
    {
      title: "Break saved replies into tickets for the next sprint",
      ownerId: "per_jonas",
      dueInDays: 2,
      priority: "medium",
    },
    {
      title: "Share the composer mockups with saved replies",
      ownerId: "per_lena",
      dueInDays: 4,
      priority: "low",
    },
  ],
};

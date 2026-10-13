import type {
  MeetingSentiment,
  Participation,
  Priority,
  SentimentLabel,
  Severity,
} from "@/types";
import { uploadTranscript } from "./upload-transcript";

/** A transcript line before it belongs to a meeting: no id yet. */
export type TemplateLine = {
  speakerId: string;
  startSec: number;
  endSec: number;
  text: string;
  sentiment: SentimentLabel;
};

type PreparedTask = { title: string; ownerId: string; dueInDays: number; priority: Priority };

/**
 * The transcript an analysis writes, with what it found in it. `line` is a line's number,
 * from 1; a chapter runs from its first line to its last.
 */
export type PreparedTranscript = {
  lines: TemplateLine[];
  chapters: [title: string, first: number, last: number][];
  insights: { line: number; text: string }[];
  risks: { line: number; text: string; severity: Severity }[];
  suggestedTasks: (PreparedTask & { line: number })[];
};

/**
 * What the mock analysis "finds" when a meeting finishes processing: the summary, the mood,
 * who spoke, the decisions and tasks, and with a transcript, the sentence each one came from.
 * Due days count from the day the analysis ends.
 */
export type PreparedAnalysis = {
  summary: string[];
  sentiment: MeetingSentiment;
  participation: Participation[];
  decisions: { text: string; line?: number }[];
  actionItems: (PreparedTask & { line?: number })[];
  transcript?: PreparedTranscript;
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
      { text: "Annual plans move to the new invoice engine on November 2." },
      { text: "Monthly plans wait for one clean billing cycle on the new engine." },
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
    decisions: [{ text: "The team invite moves from the first screen to a day-two prompt." }],
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

/** What every uploaded file turns into: a planning call of the product team, transcript and all. */
export const uploadTemplate: UploadTemplate = {
  participantIds: ["per_amira", "per_jonas", "per_lena", "per_marcus"],
  durationMin: 28,
  summary: [
    "With nine days to the beta review, the team cut the scope to saved replies and the small " +
      "dark mode fixes. The analytics export waits for the new event schema, which nobody on " +
      "the data team owns yet.",
    "Saved replies open from a slash command in the composer and reuse the mention picker; " +
      "five of six agents in testing reached for the keyboard first.",
    "Marcus flagged that replies with empty variables have no test data. A rule that drops " +
      "the greeting goes in, and support hears about the beta before it starts this time.",
  ],
  sentiment: { score: 0.3, label: "positive" },
  participation: [
    { personId: "per_amira", talkSharePct: 34, segmentCount: 11 },
    { personId: "per_jonas", talkSharePct: 32, segmentCount: 9 },
    { personId: "per_lena", talkSharePct: 17, segmentCount: 5 },
    { personId: "per_marcus", talkSharePct: 17, segmentCount: 5 },
  ],
  decisions: [
    { text: "Saved replies ship before the beta review.", line: 9 },
    { text: "The analytics export waits for the new event schema.", line: 11 },
    { text: "Saved replies open from a slash command in the composer first.", line: 15 },
  ],
  actionItems: [
    {
      title: "Share the composer mockups with saved replies",
      ownerId: "per_lena",
      dueInDays: 3,
      priority: "medium",
      line: 15,
    },
    {
      title: "Break saved replies into tickets for the next sprint",
      ownerId: "per_jonas",
      dueInDays: 1,
      priority: "medium",
      line: 19,
    },
    {
      title: "Write the test plan for saved replies, empty variables included",
      ownerId: "per_marcus",
      dueInDays: 5,
      priority: "high",
      line: 24,
    },
  ],
  transcript: uploadTranscript,
};

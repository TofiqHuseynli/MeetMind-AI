import type { PreparedTranscript, TemplateLine } from "./analyses";

type Line = [
  speakerId: string,
  lengthSec: number,
  text: string,
  sentiment?: TemplateLine["sentiment"],
];

// Lines follow each other with a two second pause, so only their lengths are written here.
function lines(rows: Line[]): TemplateLine[] {
  let at = 0;
  return rows.map(([speakerId, lengthSec, text, sentiment = "neutral"]) => {
    const line = { speakerId, startSec: at, endSec: at + lengthSec, text, sentiment };
    at += lengthSec + 2;
    return line;
  });
}

// What every upload "says": a planning call nine days before a beta review. Links point at
// lines by their number, from 1.
export const uploadTranscript: PreparedTranscript = {
  lines: lines([
    ["per_amira", 45, "Morning. We have nine days until the beta review, so today is about " +
      "cutting. What ships, what waits."],
    ["per_jonas", 60, "Then let me put the list up. Saved replies, the analytics export and " +
      "the dark mode fixes. Realistically we have room for one big thing and the small fixes."],
    ["per_lena", 50, "Saved replies is the one I hear about in every interview. " +
      "Agents type the same answer twenty times a day.", "positive"],
    ["per_amira", 55, "Same from sales. And the export? Who asked for it?"],
    ["per_jonas", 70, "Mostly the enterprise accounts. I checked this morning: " +
      "two of the three asks on the export come from the same five customers."],
    ["per_amira", 40, "So it matters, but to five customers, not to everyone in the beta."],
    ["per_jonas", 75, "And it has a dependency. The export needs the new event schema, " +
      "and nobody on the data team owns that yet. I asked twice.", "negative"],
    ["per_marcus", 45, "If the schema lands late, I can't test the export before the review " +
      "anyway.", "negative"],
    ["per_amira", 60, "Then let's decide. Saved replies ship before the beta review. " +
      "The export waits for the schema.", "positive"],
    ["per_jonas", 35, "Agreed. The dark mode fixes ride along, they are small.", "positive"],
    ["per_amira", 50, "And to be clear for the notes: the analytics export waits until the " +
      "data team has the new event schema."],
    ["per_lena", 80, "On saved replies, I have two options for where the list lives. " +
      "A slash command in the composer, or a panel on the right."],
    ["per_jonas", 55, "The slash command is cheaper. The panel needs a new layout on mobile."],
    ["per_lena", 65, "Agents in the tests reached for the keyboard first. " +
      "Five out of six typed a slash before they looked for a button.", "positive"],
    ["per_amira", 45, "Then the slash command first. Lena, can you share the composer " +
      "mockups with it by Thursday?"],
    ["per_lena", 30, "Yes, Thursday works.", "positive"],
    ["per_jonas", 70, "One thing on shortcuts: we should reuse the mention picker. " +
      "Same keyboard handling, same list component. It saves us a week.", "positive"],
    ["per_lena", 40, "Fine by me, as long as the list shows a preview of the reply."],
    ["per_amira", 50, "Jonas, will you break it into tickets so we can start on Monday?"],
    ["per_jonas", 35, "I'll have them up by tomorrow."],
    ["per_amira", 45, "Marcus, where are we on testing?"],
    ["per_marcus", 85, "Worried, honestly. Saved replies with variables, like the " +
      "customer's name, have no test data yet. If a variable is empty, we could send a " +
      "reply that says hello, comma, nothing.", "negative"],
    ["per_jonas", 50, "We can fall back to no greeting when the name is missing. " +
      "That's a small rule."],
    ["per_marcus", 60, "That helps. I'll write the test plan for saved replies this week, " +
      "with the empty variable cases in it.", "positive"],
    ["per_amira", 40, "Good. Put it next to the beta checklist so support sees it too."],
    ["per_marcus", 55, "And someone should tell support what is in the beta. " +
      "They found out about the last one from customers.", "negative"],
    ["per_amira", 60, "Fair. That's on me. Last time the release notes went out after the " +
      "beta started, which is backwards."],
    ["per_jonas", 55, "Nine days with one sprint of real work. It's tight, but it fits if " +
      "nothing else comes in."],
    ["per_amira", 50, "Then nothing else comes in. I'll guard the scope. " +
      "Let's also book the review with support in the room.", "positive"],
    ["per_marcus", 35, "Sounds good. I'll bring the test results.", "positive"],
  ]),
  chapters: [
    ["Scope for the beta review", 1, 11],
    ["Saved replies in the composer", 12, 20],
    ["Testing and support", 21, 30],
  ],
  insights: [
    {
      line: 5,
      text: "Two of the three export asks come from the same five enterprise accounts: " +
        "it matters to a few large customers, not to the beta as a whole.",
    },
    {
      line: 14,
      text: "Five of six agents in testing typed a slash before looking for a button, " +
        "which backs the slash command over a side panel.",
    },
    {
      line: 27,
      text: "Support learned about the last beta from customers because the release notes " +
        "went out after it started.",
    },
  ],
  risks: [
    {
      line: 7,
      text: "The new event schema has no owner on the data team, so the analytics export " +
        "can slip past the beta.",
      severity: "medium",
    },
    {
      line: 22,
      text: "Saved replies with variables have no test data; an empty name could send a " +
        "broken greeting to customers.",
      severity: "high",
    },
    {
      line: 28,
      text: "Nine days with one sprint of real work leaves no room for new scope.",
      severity: "low",
    },
  ],
  suggestedTasks: [
    {
      line: 7,
      title: "Find an owner for the new event schema on the data team",
      ownerId: "per_amira",
      dueInDays: 3,
      priority: "high",
    },
    {
      line: 26,
      title: "Send support a short note on what the beta includes",
      ownerId: "per_amira",
      dueInDays: 4,
      priority: "medium",
    },
  ],
};

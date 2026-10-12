import type { SentimentLabel, TranscriptSegment } from "@/types";

type Line = [
  speakerId: string,
  startSec: number,
  endSec: number,
  text: string,
  sentiment?: SentimentLabel,
];

// Builds ids seg_<prefix>_01, seg_<prefix>_02 … so other seed files can point at a line
// by number.
function segments(meetingId: string, prefix: string, lines: Line[]): TranscriptSegment[] {
  return lines.map(([speakerId, startSec, endSec, text, sentiment = "neutral"], index) => ({
    id: `seg_${prefix}_${String(index + 1).padStart(2, "0")}`,
    meetingId,
    speakerId,
    startSec,
    endSec,
    text,
    sentiment,
  }));
}

// Billing v2 scope, 2026-09-22.
const billingScope = segments("mtg_billing_scope", "billing", [
  ["per_amira", 0, 36, "Okay, let's start. " +
    "One goal today: lock the scope of Billing v2. " +
    "Not the design, just what is in and what is out."],
  ["per_jonas", 37, 64, "Before we lock anything, I want numbers on the table. " +
    "Last time we argued from gut feeling."],
  ["per_amira", 66, 76, "Fair. Elif, can you start with support?"],
  ["per_elif", 79, 112,
    "Sure. We logged 41 support tickets about plan changes in the last thirty days. " +
    "It's our biggest billing category by far.", "negative"],
  ["per_amira", 113, 123, "Forty-one. Was August anywhere near that?"],
  ["per_elif", 125, 152, "Not even close. And the tone is changing. " +
    "People ask whether they can trust our invoices at all.", "negative"],
  ["per_sofia", 155, 185, "I can break that down. " +
    "Of the 41, 27 are upgrades, 9 are downgrades and 5 are seat changes."],
  ["per_sofia", 186, 217, "The bigger worry is the invoices themselves. " +
    "The invoice failure rate is 3.8% this month, up from 2.1% in August.", "negative"],
  ["per_jonas", 219, 232, "Sorry, 3.8? That's nearly double. Do we know why?"],
  ["per_priya", 235, 279,
    "We do. Most failures come from payment webhook retries arriving out of order. " +
    "The renewal event lands before the upgrade event, so the invoice uses the old plan.",
    "negative"],
  ["per_jonas", 280, 293, "So it's not the payment provider. It's us."],
  ["per_priya", 295, 334,
    "It's us. Our handler assumes events arrive in order, and under retries they don't. " +
    "It got worse when the provider shortened its retry window in August."],
  ["per_amira", 337, 348, "Can that wait until after v2?"],
  ["per_jonas", 349, 369, "No. " +
    "If we build usage-based invoicing on broken ordering, we multiply the problem."],
  ["per_amira", 371, 393, "Okay, agreed. " +
    "The webhook ordering fix is a must-fix inside v2, and it goes first.", "positive"],
  ["per_priya", 396, 429, "I'll make the handler idempotent and order events by sequence number. " +
    "I'll ship the webhook idempotency fix to staging by Thursday."],
  ["per_amira", 430, 448, "Now the big one, usage-based invoicing. " +
    "Jonas, what's the honest estimate?"],
  ["per_jonas", 450, 471, "Four weeks. " +
    "That's with a single usage dimension, messages per month, and nothing else."],
  ["per_amira", 474, 488, "Customers have asked for seats plus messages, though."],
  ["per_jonas", 489, 519, "Then it isn't four weeks. " +
    "Every extra dimension is another meter, another invoice line and another way to be wrong."],
  ["per_sofia", 521, 554,
    "For what it's worth, messages per month explains most of what large accounts pay. " +
    "Seat counts barely move from month to month."],
  ["per_amira", 557, 574, "That settles it for me. One dimension: messages per month.", "positive"],
  ["per_elif", 575, 598, "Can we talk about multi-currency? " +
    "Three of our biggest prospects want to pay in euros."],
  ["per_priya", 600, 631, "Multi-currency isn't just a currency symbol. " +
    "It drags in a tax provider integration, VAT rules per country and local invoice formats.",
    "negative"],
  ["per_jonas", 634, 656, "That's four to six weeks on its own. More if legal gets involved."],
  ["per_elif", 657, 680, "But they ask about it on every call. " +
    "I'd hate to tell them next year.", "negative"],
  ["per_amira", 682, 710, "Not next year. Multi-currency is deferred to Q1. " +
    "I'll tell sales myself, so it doesn't land on your team."],
  ["per_elif", 713, 726, "Okay. Q1 I can sell. Thank you.", "positive"],
  ["per_jonas", 727, 753, "While we're cutting, can we bill usage in arrears only? " +
    "Prepaid credits would double the edge cases."],
  ["per_amira", 755, 774, "Yes. Usage-based invoicing is billed in arrears only. " +
    "No prepaid bundles in v2."],
  ["per_priya", 777, 805, "One more scope question. " +
    "Plan changes both ways mean proration, and that's where our edge cases live."],
  ["per_amira", 806, 816, "What if v2 only does upgrades?"],
  ["per_jonas", 818, 849, "Upgrades are easy. You pay the difference today and you're done. " +
    "Downgrades need credits, refunds and a rule for unused messages."],
  ["per_elif", 852, 867,
    "Nine downgrade tickets are still nine unhappy customers, though.", "negative"],
  ["per_amira", 868, 901,
    "They are. But support can handle downgrades by hand for one more quarter. " +
    "So, compromise: self-serve plan upgrades only, no downgrades."],
  ["per_elif", 903, 929, "Fine, I can live with that. " +
    "As long as my team gets a clean manual process for downgrades."],
  ["per_priya", 932, 964, "I'll still do a one-day spike on proration edge cases. " +
    "I want to know what breaks before we promise dates."],
  ["per_sofia", 965, 997, "One warning before we wrap. " +
    "At this failure rate, escalations may come before v2 lands. " +
    "Probably two or three key accounts.", "negative"],
  ["per_elif", 999, 1031,
    "Then I'll collect the top ten billing complaints with examples by end of week. " +
    "We'll know which accounts to call first."],
  ["per_sofia", 1034, 1068,
    "And I'll add a daily invoice failure rate line to the ops dashboard. " +
    "That way we see the moment the fix lands."],
  ["per_jonas", 1069, 1094, "I'll draft the rating engine design by Monday. " +
    "Priya, the job that counts messages is yours?"],
  ["per_priya", 1096, 1117, "Yes. " +
    "I'll build a per-account daily message aggregation job to feed the rating engine."],
  ["per_amira", 1120, 1153,
    "Great. I'll write the scope doc tonight and share it in the channel. " +
    "Thanks, everyone. That was a good one.", "positive"],
]);

// Sprint 14 planning, 2026-09-29.
const mobileSprint = segments("mtg_mobile_sprint", "mobile", [
  ["per_jonas", 0, 46, "Okay, Sprint 14. " +
    "Last sprint before the beta cut on October 13, so whatever we pick has to ship. " +
    "Lena, you wanted to open with empty states."],
  ["per_lena", 47, 93, "Yes. Right now every empty state in the app is placeholder lorem text. " +
    "A beta user opens an empty inbox and sees fake Latin. That's our first impression.",
    "negative"],
  ["per_daniel", 95, 116, "To be fair, they were meant to be temporary. We never had specs."],
  ["per_lena", 119, 143, "I know, that one's on me. But we can't ship a beta like that."],
  ["per_tomas", 144, 157, "How many screens are we talking about?"],
  ["per_lena", 159, 181, "Seven. Inbox, search, contacts, drafts and three in settings. " +
    "Mostly copy, plus one illustration."],
  ["per_jonas", 184, 198, "Then it's small. Empty states are in.", "positive"],
  ["per_lena", 199, 219,
    "Great. I'll have the empty state specs in Figma by tomorrow noon.", "positive"],
  ["per_jonas", 221, 231, "Marcus, where are we on tests?"],
  ["per_marcus", 234, 272, "Not great. The Android e2e suite is 30% flaky right now. " +
    "Three runs in ten fail on something that passes on retry.", "negative"],
  ["per_daniel", 273, 285, "Thirty? It was around ten in August."],
  ["per_marcus", 287, 319, "It crept up when we added the composer tests. " +
    "Most failures are timing: the keyboard animation and the network mocks."],
  ["per_tomas", 322, 341, "Can we just quarantine the bad ones until after beta?"],
  ["per_marcus", 342, 362,
    "Then we're blind on the composer, which is exactly what we're changing.", "negative"],
  ["per_jonas", 364, 390, "Middle ground. " +
    "We fix the ten flakiest tests first and keep the rest running with retries."],
  ["per_marcus", 393, 418, "That works. " +
    "I'll send you the flaky test list today, ranked by failure count."],
  ["per_jonas", 419, 428, "Good. Tomás, the offline queue."],
  ["per_tomas", 430, 483, "The queue itself is simple. Conflicts are the scary part. " +
    "Say I edit a draft offline on the train, and a colleague sends the same draft from web. " +
    "My phone reconnects. Now what?"],
  ["per_daniel", 486, 512, "Today? It sends twice, or it overwrites the sent one. " +
    "Not sure which is worse.", "negative"],
  ["per_lena", 513, 553, "We covered this in design review. Last edit wins. " +
    "The device that lost shows a banner saying the draft was sent from another device."],
  ["per_tomas", 555, 570, "Last edit by phone time or by server time?"],
  ["per_lena", 573, 583, "Server time. Phone clocks lie."],
  ["per_tomas", 584, 607, "Okay, that's simpler. " +
    "With the banner, I'd say six days for the offline queue."],
  ["per_jonas", 609, 630, "Six days is most of your sprint. " +
    "Which brings me to push notifications."],
  ["per_tomas", 633, 656, "I was hoping we'd get to push. Customers ask for it every week."],
  ["per_jonas", 657, 697, "They do, but three things block it. " +
    "There are no backend topics yet, and Priya is on billing. " +
    "And the settings screen isn't designed."],
  ["per_lena", 699, 727, "Settings is a week of design on its own. " +
    "I can't do that and the empty states."],
  ["per_jonas", 730, 746, "So push notifications move to the sprint after beta."],
  ["per_tomas", 747, 760, "Fine. Not happy about it, but fine.", "negative"],
  ["per_marcus", 762, 797, "If offline is in, I need the device matrix updated. " +
    "At least two poor-network devices, or I can't really test the queue."],
  ["per_tomas", 800, 836, "You don't need new hardware for iOS. " +
    "I can give you network link conditioner profiles for slow, lossy and dropping networks.",
    "positive"],
  ["per_marcus", 837, 867, "That helps. I'll update the device matrix. " +
    "For Android I still want two cheap phones on bad Wi-Fi."],
  ["per_jonas", 869, 884, "Order them today and expense it. Daniel, the composer?"],
  ["per_daniel", 887, 913,
    "I'll extract the shared composer package so web and mobile use one editor. " +
    "Four days."],
  ["per_lena", 914, 925, "Any risk to how it looks?"],
  ["per_daniel", 927, 958, "Font drift in webviews. " +
    "Android webviews bring their own fonts, so line heights can move a pixel or two.", "negative"],
  ["per_lena", 961, 982, "A pixel in a composer means the cursor jumps. People notice that."],
  ["per_daniel", 983, 1007, "I'll add screenshot tests for three screen sizes. " +
    "If it drifts, we'll see it."],
  ["per_tomas", 1009, 1041, "One more risk. App Store review took nine days last time. " +
    "If we submit late, the beta date means nothing.", "negative"],
  ["per_jonas", 1044, 1085, "I don't want a broken build sitting in review either. " +
    "We submit the public build only after the regression pass. TestFlight can go earlier."],
  ["per_marcus", 1086, 1116, "Then I start the regression pass early, on nightly builds. " +
    "Most of it should be done before freeze."],
  ["per_jonas", 1118, 1156, "Let me add it up. " +
    "Offline queue six, composer four, empty states four, flaky tests three. " +
    "That's seventeen engineer days in a ten-day sprint."],
  ["per_daniel", 1159, 1187, "With two of us on app code, that's twenty days of capacity. " +
    "Three days of slack.", "negative"],
  ["per_jonas", 1188, 1228, "So the freeze has to be real. " +
    "Code freeze on the 10th, and it needs a green e2e run. " +
    "No green run, no freeze."],
  ["per_lena", 1230, 1252, "Tight, but it's a sprint I'd be proud to ship. Let's go.", "positive"],
]);

// Relay 2.0 beta readiness, 2026-10-06.
const releaseReadiness = segments("mtg_release_readiness", "release", [
  ["per_amira", 0, 36, "Okay, this is the go or no-go prep for the Relay 2.0 beta. " +
    "Fifty accounts on October 14. I want a clear list today, not a feeling."],
  ["per_jonas", 37, 45, "Marcus has the freshest numbers. Marcus?"],
  ["per_marcus", 47, 76, "Regression is at 70%, and most of it is green. " +
    "But the offline queue crashes on older Android phones when storage is nearly full.",
    "negative"],
  ["per_amira", 79, 86, "How old is older?"],
  ["per_marcus", 87, 116, "Android 10 and 11, with less than about 200 megabytes free. " +
    "The queue tries to write the draft and the app just dies.", "negative"],
  ["per_tomas", 118, 155, "I know where that is. We never check free space before writing. " +
    "The fix is to check first and show a storage full state instead of crashing. " +
    "One day."],
  ["per_jonas", 158, 173, "Is it really a blocker, though? Phones that full are rare."],
  ["per_elif", 174, 197, "Not with our customers. " +
    "Many field teams use older shared devices, and those are always full of photos.", "negative"],
  ["per_jonas", 199, 204, "Okay, that changes it."],
  ["per_amira", 207, 221, "Then it's a beta blocker, and it's fixed by Thursday."],
  ["per_tomas", 222, 240, "Thursday works. " +
    "I'll fix the storage crash and test it on Marcus's oldest phone.", "positive"],
  ["per_jonas", 242, 276, "Next, the date. I want a hard rule: go or no-go at noon on the 13th. " +
    "If we miss it, we slip a week, not a day."],
  ["per_elif", 279, 289, "A week? Customers were told the 14th.", "negative"],
  ["per_jonas", 290, 308, "I know. But one-day slips turn into five one-day slips. " +
    "I've watched it happen."],
  ["per_amira", 310, 335, "Agreed. Go or no-go is noon on the 13th, and a miss slips a week. " +
    "Elif, who's in the fifty?"],
  ["per_elif", 338, 375, "We have 62 accounts opted in, and I'd rather not take the first 50. " +
    "I want a mix of sizes: small teams, mid-size and a few large ones."],
  ["per_marcus", 376, 387, "Large accounts mean more load on day one, though."],
  ["per_elif", 389, 413, "That's the point. " +
    "If it breaks at their size, I want to find out in beta, not at launch."],
  ["per_amira", 416, 425, "Makes sense. We take the mix."],
  ["per_elif", 426, 444,
    "I'll send the final fifty to Jonas tomorrow, with the size of each account."],
  ["per_lena", 446, 472,
    "Can I raise something? The onboarding tour still shows the old composer. " +
    "The first thing beta users see would be wrong.", "negative"],
  ["per_tomas", 475, 489,
    "Oh no, you're right. The screenshots and every tooltip position.", "negative"],
  ["per_jonas", 490, 497, "How long to fix it?"],
  ["per_lena", 499, 510, "Two days of design and one day of wiring."],
  ["per_amira", 513, 523, "Then we update it before the freeze."],
  ["per_lena", 524, 545, "I'll have the new tour screens ready by Thursday. " +
    "Tomás, can you wire them on Friday?"],
  ["per_tomas", 547, 557, "Friday, yes. I'll wire the new tour then."],
  ["per_marcus", 560, 586, "My worry is support load on day one. " +
    "Fifty new accounts, a new composer and offline sync, all at once.", "negative"],
  ["per_elif", 587, 613, "I'll staff a beta channel for the first week. " +
    "But I need a named escalation engineer, not a shared inbox."],
  ["per_jonas", 615, 625, "That's me for week one. Tomás covers iOS."],
  ["per_amira", 628, 657, "And I'll write the release notes. " +
    "Push notifications get listed as coming. " +
    "The storage limitation gets explained in plain words, no jargon."],
  ["per_jonas", 658, 679,
    "One more. If we have to roll back, what happens to drafts still in the queue?"],
  ["per_tomas", 681, 708, "Nothing is lost. The queue is versioned. " +
    "An older build keeps the drafts and sends them once the next build is installed.", "positive"],
  ["per_amira", 711, 746, "Then the rollback plan is simple. " +
    "We roll back and tell users their drafts return with the next build. " +
    "Then we ship the fix within a week."],
  ["per_jonas", 747, 781, "We also need a crash gate. The baseline is 0.4% of sessions. " +
    "If crashes stay above 1% of sessions for two days, we pause the rollout."],
  ["per_marcus", 783, 801, "Why two days? " +
    "One bad day with fifty accounts is a lot of angry people."],
  ["per_jonas", 804, 821, "At fifty accounts, one day is noise. Two days is a trend."],
  ["per_amira", 822, 834, "Fine. Above 1% for two days pauses the rollout."],
  ["per_lena", 836, 868, "Last thing. Can we get the in-app feedback button on mobile? " +
    "Web has it, and beta users on phones have nowhere to tell us what broke."],
  ["per_jonas", 871, 881, "That's Daniel's area. I'll ask him today."],
  ["per_marcus", 882, 898, "And I'll add it to the regression checklist so it doesn't slip."],
  ["per_amira", 900, 916, "Great. Go or no-go on the 13th at noon. Thanks, everyone.", "positive"],
]);

export const transcriptSegments: TranscriptSegment[] = [
  ...billingScope,
  ...mobileSprint,
  ...releaseReadiness,
];

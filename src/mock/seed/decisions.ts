import type { Decision } from "@/types";

// Each decision points at the sentence where the group agreed on it.
export const decisions = [
  // Billing v2 scope, 2026-09-22.
  {
    id: "dec_billing_1",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_15",
    text: "The webhook ordering fix is a must-fix inside Billing v2 and ships first.",
  },
  {
    id: "dec_billing_2",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_22",
    text: "Usage-based invoicing uses a single dimension: messages per month.",
  },
  {
    id: "dec_billing_3",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_27",
    text: "Multi-currency moves to Q1; Amira tells sales herself.",
  },
  {
    id: "dec_billing_4",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_30",
    text: "Usage-based invoicing is billed in arrears only; no prepaid bundles in v2.",
  },
  {
    id: "dec_billing_5",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_35",
    text: "Self-serve plan changes cover upgrades only; " +
      "support handles downgrades by hand for one more quarter.",
  },

  // Sprint 14 planning, 2026-09-29.
  {
    id: "dec_mobile_1",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_07",
    text: "Empty states for all seven screens are in Sprint 14.",
  },
  {
    id: "dec_mobile_2",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_15",
    text: "The ten flakiest Android e2e tests get fixed first; the rest keep running with retries.",
  },
  {
    id: "dec_mobile_3",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_20",
    text: "Offline draft conflicts resolve as last edit wins; " +
      "the device that lost shows a banner.",
  },
  {
    id: "dec_mobile_4",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_28",
    text: "Push notifications move to the sprint after beta.",
  },
  {
    id: "dec_mobile_5",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_40",
    text: "The public App Store build is submitted only after the regression pass; " +
      "TestFlight can go earlier.",
  },
  {
    id: "dec_mobile_6",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_44",
    text: "Code freeze is October 10 and needs a green e2e run.",
  },

  // Relay 2.0 beta readiness, 2026-10-06.
  {
    id: "dec_release_1",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_10",
    text: "The offline queue storage crash is a beta blocker and is fixed by Thursday.",
  },
  {
    id: "dec_release_2",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_15",
    text: "Go/no-go is at noon on October 13; a miss slips the beta a week, not a day.",
  },
  {
    id: "dec_release_3",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_19",
    text: "The fifty beta accounts are a mix of small, mid-size and large teams.",
  },
  {
    id: "dec_release_4",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_25",
    text: "The onboarding tour is updated to the new composer before the freeze.",
  },
  {
    id: "dec_release_5",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_30",
    text: "Jonas is the escalation engineer for beta week one; Tomás covers iOS.",
  },
  {
    id: "dec_release_6",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_38",
    text: "Crashes above 1% of sessions for two days pause the rollout.",
  },
] satisfies Decision[];

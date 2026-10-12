import type { Insight } from "@/types";

// What the AI noticed about a moment of the meeting, pinned to that sentence.
export const insights = [
  // Billing v2 scope, 2026-09-22.
  {
    id: "ins_billing_1",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_07",
    text: "Upgrades are two thirds of plan-change tickets, " +
      "so self-serve upgrades alone remove most of that support load.",
  },
  {
    id: "ins_billing_2",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_11",
    text: "The failure spike comes from our own webhook handler, not the provider, " +
      "so the fix is fully in the team's hands.",
  },
  {
    id: "ins_billing_3",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_21",
    text: "Seat counts barely change month to month, " +
      "so messages per month carries almost all of the billing signal.",
  },
  {
    id: "ins_billing_4",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_33",
    text: "Splitting upgrades from downgrades removes the proration dependency.",
  },
  {
    id: "ins_billing_5",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_40",
    text: "A daily failure-rate line turns the webhook fix into an outcome " +
      "the team can see within days.",
  },

  // Sprint 14 planning, 2026-09-29.
  {
    id: "ins_mobile_1",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_02",
    text: "Empty states are the first screen a new beta user sees, " +
      "so placeholder copy costs more than its size suggests.",
  },
  {
    id: "ins_mobile_2",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_12",
    text: "Flakiness rose with the composer tests and is mostly timing, " +
      "which points at the test setup rather than the app.",
  },
  {
    id: "ins_mobile_3",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_22",
    text: "Ordering edits by server time removes device clock skew " +
      "as a way to pick the wrong conflict winner.",
  },
  {
    id: "ins_mobile_4",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_31",
    text: "Network conditioner profiles cover poor-network testing on iOS without new hardware.",
  },
  {
    id: "ins_mobile_5",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_42",
    text: "Planned work fills 85% of capacity in the last sprint before beta, " +
      "leaving little room for surprises.",
  },

  // Relay 2.0 beta readiness, 2026-10-06.
  {
    id: "ins_release_1",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_08",
    text: "Customer context changed the call: " +
      "field teams on shared, full devices make a rare crash a common one.",
  },
  {
    id: "ins_release_2",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_14",
    text: "A one-week slip rule trades a short delay for predictability; " +
      "repeated one-day slips erode trust faster.",
  },
  {
    id: "ins_release_3",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_18",
    text: "Choosing beta accounts by size, not sign-up order, " +
      "tests the release at real customer load.",
  },
  {
    id: "ins_release_4",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_33",
    text: "A versioned queue keeps drafts safe in a rollback, which lowers the cost of a no-go.",
  },
  {
    id: "ins_release_5",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_37",
    text: "At fifty accounts, a two-day window separates a real crash trend from daily noise.",
  },
] satisfies Insight[];

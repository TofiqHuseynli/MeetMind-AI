import type { Risk } from "@/types";

// Each risk points at the sentence where it was raised.
export const risks = [
  // Billing v2 scope, 2026-09-22.
  {
    id: "rsk_billing_1",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_08",
    text: "The invoice failure rate is 3.8% this month, up from 2.1% in August.",
    severity: "high",
  },
  {
    id: "rsk_billing_2",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_20",
    text: "Every extra usage dimension adds a meter and an invoice line; " +
      "scope creep breaks the four-week estimate.",
    severity: "medium",
  },
  {
    id: "rsk_billing_3",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_26",
    text: "Deferring multi-currency may cost three large prospects who want to pay in euros.",
    severity: "medium",
  },
  {
    id: "rsk_billing_4",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_34",
    text: "Downgrades stay manual for a quarter, about nine tickets a month for support.",
    severity: "low",
  },
  {
    id: "rsk_billing_5",
    meetingId: "mtg_billing_scope",
    segmentId: "seg_billing_38",
    text: "Two or three key accounts may escalate over failed invoices before v2 lands.",
    severity: "high",
  },

  // Sprint 14 planning, 2026-09-29.
  {
    id: "rsk_mobile_1",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_10",
    text: "The Android e2e suite is 30% flaky, up from about 10% in August.",
    severity: "high",
  },
  {
    id: "rsk_mobile_2",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_19",
    text: "On reconnect, an offline draft can send twice or overwrite the message already sent.",
    severity: "high",
  },
  {
    id: "rsk_mobile_3",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_36",
    text: "Android webviews bring their own fonts, so composer line heights can drift " +
      "and the cursor can jump.",
    severity: "medium",
  },
  {
    id: "rsk_mobile_4",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_39",
    text: "App Store review took nine days last time; a late submission misses the beta date.",
    severity: "high",
  },
  {
    id: "rsk_mobile_5",
    meetingId: "mtg_mobile_sprint",
    segmentId: "seg_mobile_43",
    text: "Seventeen engineer days of work against twenty of capacity leaves three days of slack.",
    severity: "medium",
  },

  // Relay 2.0 beta readiness, 2026-10-06.
  {
    id: "rsk_release_1",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_05",
    text: "The offline queue crashes on Android 10 and 11 with less than 200 MB of free storage.",
    severity: "high",
  },
  {
    id: "rsk_release_2",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_13",
    text: "Customers were promised October 14; a one-week slip needs early, clear communication.",
    severity: "medium",
  },
  {
    id: "rsk_release_3",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_21",
    text: "The onboarding tour still shows the old composer, the first thing beta users see.",
    severity: "medium",
  },
  {
    id: "rsk_release_4",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_28",
    text: "Day-one support load: fifty new accounts meet a new composer and offline sync at once.",
    severity: "medium",
  },
  {
    id: "rsk_release_5",
    meetingId: "mtg_release_readiness",
    segmentId: "seg_release_39",
    text: "Beta users on phones have no in-app way to report what broke.",
    severity: "low",
  },
] satisfies Risk[];

import type { TranscriptChapter } from "@/types";
import { transcriptSegments } from "./transcripts";

type Row = [title: string, first: number, last: number];

// Builds a meeting's chapters from line numbers, so the times always match the transcript.
function chapters(meetingId: string, prefix: string, rows: Row[]): TranscriptChapter[] {
  const line = (n: number) => {
    const id = `seg_${prefix}_${String(n).padStart(2, "0")}`;
    const segment = transcriptSegments.find((s) => s.id === id);
    if (!segment) throw new Error(`Chapter seed points at a missing line ${id}`);
    return segment;
  };
  return rows.map(([title, first, last], index) => ({
    id: `chp_${prefix}_${index + 1}`,
    meetingId,
    title,
    firstSegmentId: line(first).id,
    lastSegmentId: line(last).id,
    startSec: line(first).startSec,
    endSec: line(last).endSec,
  }));
}

// How the analysis split each full transcript into topics, in spoken order.
export const transcriptChapters: TranscriptChapter[] = [
  ...chapters("mtg_billing_scope", "billing", [
    ["Plan-change tickets and failing invoices", 1, 9],
    ["The webhook ordering bug", 10, 16],
    ["Usage billing on messages only", 17, 22],
    ["Multi-currency moves to Q1", 23, 28],
    ["Billing in arrears, upgrades only", 29, 36],
    ["Escalation risk and next steps", 37, 43],
  ]),
  ...chapters("mtg_mobile_sprint", "mobile", [
    ["Empty states for the beta", 1, 8],
    ["Flaky Android tests", 9, 16],
    ["Offline queue conflicts", 17, 23],
    ["Push notifications wait", 24, 29],
    ["Test devices and the shared composer", 30, 38],
    ["App Store timing and sprint capacity", 39, 45],
  ]),
  ...chapters("mtg_release_readiness", "release", [
    ["Storage crash on older Android phones", 1, 11],
    ["The go or no-go rule", 12, 15],
    ["Picking the fifty beta accounts", 16, 20],
    ["The onboarding tour still shows the old composer", 21, 27],
    ["Support on day one", 28, 31],
    ["Rollback and the crash gate", 32, 38],
    ["A feedback button on mobile", 39, 42],
  ]),
];

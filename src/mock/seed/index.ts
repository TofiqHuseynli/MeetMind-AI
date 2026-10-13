import { actionItems } from "./action-items";
import { meetingAnalyses, uploadTemplate } from "./analyses";
import { transcriptChapters } from "./chapters";
import { decisions } from "./decisions";
import { insights } from "./insights";
import { meetings } from "./meetings";
import { people } from "./people";
import { risks } from "./risks";
import { suggestedTasks } from "./suggested-tasks";
import { projects, teams } from "./teams";
import { transcriptSegments } from "./transcripts";

/** The day the seed dates are written against. db/store.ts shifts them to the real today. */
export const SEED_TODAY = "2026-10-07T12:00:00.000Z";

export { actionItems, decisions, insights, meetings, people, projects, risks, teams };
export { suggestedTasks, transcriptChapters, transcriptSegments };
export { meetingAnalyses, uploadTemplate };
export type { PreparedAnalysis, PreparedTranscript, UploadTemplate } from "./analyses";

/** Throws when a seed row points at something that does not exist. Run in development. */
export function assertSeed() {
  const problems: string[] = [];
  const teamIds = new Set(teams.map((t) => t.id));
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const personIds = new Set(people.map((p) => p.id));
  const meetingById = new Map(meetings.map((m) => [m.id, m]));
  const segmentById = new Map(transcriptSegments.map((s) => [s.id, s]));

  for (const project of projects) {
    if (!teamIds.has(project.teamId)) problems.push(`${project.id}: unknown team`);
  }

  for (const meeting of meetings) {
    const project = projectById.get(meeting.projectId);
    if (!project) problems.push(`${meeting.id}: unknown project`);
    if (!teamIds.has(meeting.teamId)) problems.push(`${meeting.id}: unknown team`);
    for (const id of meeting.participantIds) {
      if (!personIds.has(id)) problems.push(`${meeting.id}: unknown participant ${id}`);
    }
    for (const row of meeting.participation) {
      if (!meeting.participantIds.includes(row.personId)) {
        problems.push(`${meeting.id}: participation for non-participant ${row.personId}`);
      }
    }
  }

  for (const segment of transcriptSegments) {
    const meeting = meetingById.get(segment.meetingId);
    if (!meeting) {
      problems.push(`${segment.id}: unknown meeting`);
    } else if (!meeting.participantIds.includes(segment.speakerId)) {
      problems.push(`${segment.id}: speaker ${segment.speakerId} is not a participant`);
    }
  }

  const linked = [...decisions, ...risks, ...insights, ...suggestedTasks];
  for (const item of linked) {
    const segment = segmentById.get(item.segmentId);
    if (!segment) problems.push(`${item.id}: unknown segment ${item.segmentId}`);
    else if (segment.meetingId !== item.meetingId) {
      problems.push(`${item.id}: segment of another meeting`);
    }
  }

  for (const chapter of transcriptChapters) {
    const first = segmentById.get(chapter.firstSegmentId);
    const last = segmentById.get(chapter.lastSegmentId);
    if (first?.meetingId !== chapter.meetingId || last?.meetingId !== chapter.meetingId) {
      problems.push(`${chapter.id}: lines of another meeting`);
    }
  }

  for (const item of suggestedTasks) {
    if (!personIds.has(item.ownerId)) problems.push(`${item.id}: unknown owner`);
  }

  for (const item of actionItems) {
    if (!meetingById.has(item.meetingId)) problems.push(`${item.id}: unknown meeting`);
    if (!personIds.has(item.ownerId)) problems.push(`${item.id}: unknown owner`);
    if (item.segmentId) {
      const segment = segmentById.get(item.segmentId);
      if (!segment) problems.push(`${item.id}: unknown segment ${item.segmentId}`);
      else if (segment.meetingId !== item.meetingId) {
        problems.push(`${item.id}: segment of another meeting`);
      }
    }
  }

  // Transcript meetings must report the same per-speaker counts as their segments.
  for (const meeting of meetings) {
    const own = transcriptSegments.filter((s) => s.meetingId === meeting.id);
    if (own.length === 0) continue;
    const counts = new Map<string, number>();
    for (const s of own) counts.set(s.speakerId, (counts.get(s.speakerId) ?? 0) + 1);
    for (const [speakerId, count] of counts) {
      const row = meeting.participation.find((p) => p.personId === speakerId);
      if (!row) problems.push(`${meeting.id}: no participation row for ${speakerId}`);
      else if (row.segmentCount !== count) {
        problems.push(`${meeting.id}: ${speakerId} has ${count} segments, not ${row.segmentCount}`);
      }
    }
  }

  // A prepared analysis speaks only of the people in its meeting.
  const analyses = [
    ...Object.entries(meetingAnalyses).map(([id, analysis]) => ({
      id,
      analysis,
      participantIds: meetingById.get(id)?.participantIds,
    })),
    {
      id: "upload template",
      analysis: uploadTemplate,
      participantIds: uploadTemplate.participantIds,
    },
  ];
  for (const { id, analysis, participantIds } of analyses) {
    if (!participantIds) {
      problems.push(`analysis ${id}: unknown meeting`);
      continue;
    }
    const named = [
      ...analysis.participation.map((row) => row.personId),
      ...analysis.actionItems.map((item) => item.ownerId),
    ];
    for (const personId of named) {
      if (!participantIds.includes(personId) || !personIds.has(personId)) {
        problems.push(`analysis ${id}: ${personId} is not a participant`);
      }
    }
  }

  // A prepared transcript: its speakers took part, its links point at its lines, and the
  // per-speaker counts agree with the participation.
  for (const { id, analysis, participantIds } of analyses) {
    const transcript = analysis.transcript;
    if (!transcript || !participantIds) continue;
    const count = transcript.lines.length;
    const inRange = (line: number | undefined) =>
      line === undefined || (line >= 1 && line <= count);
    const lineRefs = [
      ...transcript.insights.map((i) => i.line),
      ...transcript.risks.map((r) => r.line),
      ...transcript.suggestedTasks.map((s) => s.line),
      ...transcript.chapters.flatMap(([, first, last]) => [first, last]),
      ...analysis.decisions.map((d) => d.line),
      ...analysis.actionItems.map((a) => a.line),
    ];
    for (const line of lineRefs) {
      if (!inRange(line)) problems.push(`analysis ${id}: no line ${line}`);
    }
    const spoken = new Map<string, number>();
    for (const line of transcript.lines) {
      if (!participantIds.includes(line.speakerId)) {
        problems.push(`analysis ${id}: speaker ${line.speakerId} is not a participant`);
      }
      spoken.set(line.speakerId, (spoken.get(line.speakerId) ?? 0) + 1);
    }
    for (const row of analysis.participation) {
      const lines = spoken.get(row.personId) ?? 0;
      if (lines !== row.segmentCount) {
        const expected = row.segmentCount;
        problems.push(`analysis ${id}: ${row.personId} has ${lines} lines, not ${expected}`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Seed data is inconsistent:\n${problems.join("\n")}`);
  }
}

import { useMemo } from "react";
import { useParams } from "react-router";
import { ErrorState } from "@/components/common/error-state";
import { ProcessingState, type ProcessingStep } from "@/components/common/processing-state";
import { PageTitle } from "@/components/layout/page-title";
import type { Person } from "@/types";
import { indexById } from "@/utils/array";
import { MeetingDetail } from "../components/detail/meeting-detail";
import { MeetingDetailSkeleton } from "../components/detail/states/meeting-detail-skeleton";
import { MeetingFailedState } from "../components/detail/states/meeting-failed-state";
import { MeetingHeader } from "../components/detail/header/meeting-header";
import { MeetingNotFound } from "../components/detail/states/meeting-not-found";
import { useMeeting, usePeople, useProjects, useTeams } from "../meetings.queries";

const noPeople: Person[] = [];

// The pipeline reports no step of its own, so the page shows where any analysis stands once
// the file is in.
const processingSteps: ProcessingStep[] = [
  { label: "Recording received", state: "done" },
  { label: "Transcribing and telling the speakers apart", state: "current" },
  { label: "Writing the summary, decisions and action items", state: "waiting" },
];

export function MeetingView() {
  const { id } = useParams();
  const meeting = useMeeting(id);
  const teams = useTeams();
  const projects = useProjects();
  const people = usePeople();

  const personById = useMemo(() => indexById(people.data ?? noPeople), [people.data]);

  const queries = [meeting, teams, projects, people];
  if (queries.some((query) => query.isPending)) return <MeetingDetailSkeleton />;

  // A failed refetch keeps the data it had, so only a query with nothing to show is an error.
  const failed = queries.find((query) => query.isError && query.data === undefined);
  if (failed) {
    return (
      <ErrorState
        title="Couldn't load this meeting"
        message={failed.error?.message}
        onRetry={() => queries.forEach((query) => query.refetch())}
      />
    );
  }

  const data = meeting.data;
  if (!data) return <MeetingNotFound />;

  const project = projects.data?.find((p) => p.id === data.projectId);
  const team = teams.data?.find((t) => t.id === data.teamId);
  const participants = data.participantIds.flatMap((pid) => personById.get(pid) ?? []);
  const place = { meeting: data, project, team, participants };

  return (
    <>
      <PageTitle title={data.title} />
      {data.status === "ready" ? (
        <MeetingDetail {...place} personById={personById} />
      ) : (
        <div className="grid gap-6">
          <MeetingHeader {...place} />
          {data.status === "processing" ? (
            <ProcessingState
              title="Analysing this meeting"
              description="This page updates on its own when the analysis is ready."
              steps={processingSteps}
            />
          ) : (
            <MeetingFailedState meeting={data} />
          )}
        </div>
      )}
    </>
  );
}

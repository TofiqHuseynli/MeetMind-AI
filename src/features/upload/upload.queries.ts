import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/dashboard.keys";
import { meetingKeys } from "@/features/meetings/meetings.keys";
import { useProjects } from "@/features/meetings/meetings.queries";
import { uploadMeeting } from "./upload.api";
import type { UploadMeetingInput } from "./upload.schema";

/** Sends a file; the new meeting shows in the lists and the dashboard at once, processing. */
export function useUploadMeeting() {
  const queryClient = useQueryClient();
  const projects = useProjects();
  const teamOf = (projectId: string) =>
    projects.data?.find((project) => project.id === projectId)?.teamId;

  return useMutation({
    mutationFn: (input: UploadMeetingInput) => uploadMeeting(input, teamOf),
    onSuccess: (meeting) => {
      toast.success("File received, analysing it", { description: meeting.title });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: meetingKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => toast.error("Couldn't upload the file", { description: error.message }),
  });
}

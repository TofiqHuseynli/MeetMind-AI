import { create } from "zustand";

type UploadState = {
  /**
   * The meeting made from the last upload while it is analysed; null when none is. Kept
   * outside the page, so leaving the upload page and coming back shows the same progress.
   */
  processingMeetingId: string | null;
  track: (meetingId: string) => void;
  clear: () => void;
};

export const useUploadStore = create<UploadState>()((set) => ({
  processingMeetingId: null,
  track: (meetingId) => set({ processingMeetingId: meetingId }),
  clear: () => set({ processingMeetingId: null }),
}));

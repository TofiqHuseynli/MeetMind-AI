import { create } from "zustand";

type TranscriptState = {
  /** The segment picked in the transcript, which the insight panel shows; null for none. */
  selectedSegmentId: string | null;
  selectSegment: (segmentId: string | null) => void;
};

export const useTranscriptStore = create<TranscriptState>()((set) => ({
  selectedSegmentId: null,
  selectSegment: (segmentId) => set({ selectedSegmentId: segmentId }),
}));

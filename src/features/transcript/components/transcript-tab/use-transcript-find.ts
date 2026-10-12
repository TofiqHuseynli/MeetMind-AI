import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { TimeRange, TranscriptSegment } from "@/types";
import { useTranscriptSearch } from "../../transcript.queries";
import { expandHits, parseFind, withFind, type TranscriptHit } from "../../utils/find";

export type FindStatus = "idle" | "loading" | "failed";

/**
 * The transcript search. The term lives in the URL (`?find=`), the service finds every hit in
 * the whole transcript (or in its time range), and the lines on screen mark them. A new term
 * starts at the first hit already on screen; moving to a hit that is not loaded asks `onOpenAt`
 * to open the transcript at its sentence.
 */
export function useTranscriptFind({
  meetingId,
  segments,
  range,
  onOpenAt,
}: {
  meetingId: string;
  /** The lines loaded now. */
  segments: TranscriptSegment[];
  range?: TimeRange;
  onOpenAt: (segmentId: string) => void;
}) {
  const [params, setParams] = useSearchParams();
  const term = parseFind(params);
  const [value, setValue] = useState(term);
  const [seenTerm, setSeenTerm] = useState(term);
  // The back button changes the term from outside; the box takes it over.
  if (term !== seenTerm) {
    setSeenTerm(term);
    setValue(term);
  }
  const pushTerm = useDebouncedCallback(
    (next: string) => setParams((prev) => withFind(prev, next), { replace: true }),
  );

  const search = useTranscriptSearch(meetingId, term, range);
  const hits = useMemo<TranscriptHit[]>(
    () => (search.data ? expandHits(search.data) : []),
    [search.data],
  );
  const loaded = useMemo(() => new Set(segments.map((segment) => segment.id)), [segments]);
  const firstShown = () => hits.findIndex((hit) => loaded.has(hit.segmentId));

  // -1 while no hit is current: none of them is on screen yet.
  const [hitIndex, setHitIndex] = useState(firstShown);
  const [seenHits, setSeenHits] = useState(hits);
  if (hits !== seenHits) {
    setSeenHits(hits);
    setHitIndex(firstShown());
  }

  function change(next: string) {
    setValue(next);
    pushTerm(next);
  }

  function step(delta: number) {
    if (hits.length === 0) return;
    let next = (hitIndex + delta + hits.length) % hits.length;
    if (hitIndex < 0) next = delta > 0 ? 0 : hits.length - 1;
    setHitIndex(next);
    if (!loaded.has(hits[next].segmentId)) onOpenAt(hits[next].segmentId);
  }

  let status: FindStatus = "idle";
  if (search.isLoading) status = "loading";
  else if (search.isError && !search.data) status = "failed";

  return {
    value,
    change,
    /** The term the hits are for; the lines mark this one, not the box's half-typed value. */
    term,
    hits,
    hitIndex,
    current: hitIndex >= 0 ? hits[hitIndex] : undefined,
    status,
    retry: () => search.refetch(),
    step,
  };
}

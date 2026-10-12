import { useCallback, useEffect, useRef } from "react";

/** How long a search box waits after the last key before it searches. */
export const SEARCH_DELAY_MS = 300;

/** Returns a stable function that calls `fn` once typing pauses for `ms`. */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms = SEARCH_DELAY_MS,
): (...args: Args) => void {
  const fnRef = useRef(fn);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return useCallback(
    (...args: Args) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => fnRef.current(...args), ms);
    },
    [ms],
  );
}

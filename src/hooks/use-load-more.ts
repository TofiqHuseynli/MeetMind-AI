import { useEffect, useEffectEvent, useRef } from "react";

/**
 * Infinite scroll: returns a ref for an element at the end of a list and calls `onLoadMore`
 * when that element scrolls into view, while `enabled`. Works inside a scrolling box too.
 */
export function useLoadMore<T extends Element>(onLoadMore: () => void, enabled: boolean) {
  const ref = useRef<T>(null);
  const loadMore = useEffectEvent(onLoadMore);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    // A margin starts the next batch a little before the end is reached.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadMore();
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
}

import { useState } from "react";

type Update<T> = T | ((current: T) => T);

function readStored<T>(key: string | null, fallback: T): T {
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/**
 * `useState` for a view preference that should survive a reload in this browser (the hidden
 * columns of a table). With a `null` key it is plain state. Not for data or for anything a
 * shared link should carry: that goes in the URL.
 */
export function useStoredState<T>(key: string | null, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial));

  function update(next: Update<T>) {
    const resolved = next instanceof Function ? next(value) : next;
    setValue(resolved);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch {
      // Private mode: the choice lasts for the tab.
    }
  }

  return [value, update] as const;
}

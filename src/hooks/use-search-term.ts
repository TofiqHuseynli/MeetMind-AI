import { useState } from "react";
import { useDebouncedCallback } from "./use-debounced-callback";

/**
 * A search box's text and the term the service is asked for: the term follows the text, trimmed,
 * once typing pauses. `onTermChange` tells the owner of the query about each new term.
 */
export function useSearchTerm(onTermChange?: (term: string) => void) {
  const [text, setText] = useState("");
  const [term, setTerm] = useState("");

  const pushTerm = useDebouncedCallback((next: string) => {
    const trimmed = next.trim();
    setTerm(trimmed);
    onTermChange?.(trimmed);
  });

  function changeText(next: string) {
    setText(next);
    pushTerm(next);
  }

  function clear() {
    setText("");
    setTerm("");
    onTermChange?.("");
    // Replaces a search still waiting to run, so it cannot bring an old term back.
    pushTerm("");
  }

  return { text, term, changeText, clear };
}

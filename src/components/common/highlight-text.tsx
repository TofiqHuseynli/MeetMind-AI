import { matchStarts } from "@/utils/text";

/**
 * `text` with every case-insensitive hit of `query` in a `<mark>` (amber, the search-hit color).
 * `current` picks one hit by its index as the one in view, drawn stronger. Without a query it is
 * the plain text.
 */
export function HighlightText({
  text,
  query,
  current,
}: {
  text: string;
  query: string;
  current?: number;
}) {
  const starts = matchStarts(text, query);
  if (starts.length === 0) return text;

  const length = query.trim().length;
  const parts: React.ReactNode[] = [];
  let from = 0;
  starts.forEach((start, index) => {
    if (start > from) parts.push(text.slice(from, start));
    parts.push(
      <mark key={start} data-current={index === current || undefined}>
        {text.slice(start, start + length)}
      </mark>,
    );
    from = start + length;
  });
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

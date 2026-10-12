import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/** What a searchable list in a dialog shows when nothing matches: the query and a way back. */
export function ListSearchEmpty({
  what,
  query,
  onClear,
}: {
  /** The subject of the sentence: "No one", "No project". */
  what: string;
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="grid justify-items-center gap-3 px-4 py-10 text-center">
      <SearchX aria-hidden className="size-5 text-subtle-foreground" />
      <p className="text-sm text-muted-foreground">
        {what} matches <span className="font-semibold text-foreground">“{query.trim()}”</span>
      </p>
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear search
      </Button>
    </div>
  );
}

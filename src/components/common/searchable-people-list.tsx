import { useState } from "react";
import type { Person } from "@/types";
import { includesText } from "@/utils/text";
import { ListSearchEmpty } from "./list-search-empty";
import { PeopleList } from "./people-list";
import { SearchField } from "./search-field";

/**
 * The people of one meeting with a search over name and role. They come with the meeting, so
 * the filter runs here; the list scrolls inside its dialog.
 */
export function SearchablePeopleList({ people }: { people: Person[] }) {
  const [query, setQuery] = useState("");
  const shown = people.filter((person) => includesText(`${person.name} ${person.role}`, query));

  return (
    <div className="grid gap-3">
      <SearchField
        value={query}
        onChange={setQuery}
        label="Search participants"
        placeholder="Search by name or role"
        autoFocus
      />
      <p className="sr-only" aria-live="polite">
        {shown.length} of {people.length} shown
      </p>
      <div className="-mx-2 max-h-80 overflow-y-auto px-2">
        {shown.length > 0 ? (
          <PeopleList people={shown} query={query} />
        ) : (
          <ListSearchEmpty what="No one" query={query} onClear={() => setQuery("")} />
        )}
      </div>
    </div>
  );
}

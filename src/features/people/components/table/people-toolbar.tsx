import { UserPlus } from "lucide-react";
import { useState } from "react";
import { SearchField } from "@/components/common/search-field";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

/** The search over the team, and the way to add someone. */
export function PeopleToolbar({
  q: urlQ,
  onSearch,
  onAdd,
}: {
  q: string;
  onSearch: (q: string) => void;
  onAdd: () => void;
}) {
  const [q, setQ] = useState(urlQ);
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  // The back button changes `q` from outside; our own push comes back trimmed and must not eat
  // a space the user just typed.
  if (urlQ !== seenUrlQ) {
    setSeenUrlQ(urlQ);
    if (urlQ !== q.trim()) setQ(urlQ);
  }
  const pushQ = useDebouncedCallback((value: string) => onSearch(value.trim()));

  return (
    <>
      <SearchField
        value={q}
        onChange={(value) => {
          setQ(value);
          pushQ(value);
        }}
        label="Search people"
        placeholder="Search name, role or email"
        className="min-w-50 flex-1 sm:max-w-80"
      />
      <Button onClick={onAdd} className="ml-auto">
        <UserPlus aria-hidden />
        Add person
      </Button>
    </>
  );
}

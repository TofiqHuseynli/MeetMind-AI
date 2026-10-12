import { useId } from "react";
import { BatchedList } from "@/components/common/batched-list";
import { HighlightText } from "@/components/common/highlight-text";
import { ListSearchEmpty } from "@/components/common/list-search-empty";
import { SearchField } from "@/components/common/search-field";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchTerm } from "@/hooks/use-search-term";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";
import { useProjectSearch } from "../../../meetings.queries";

const skeleton = Array.from({ length: 5 }, (_, index) => (
  <div key={index} className="flex h-12 items-center gap-3 px-2">
    <Skeleton className="size-4 rounded-full" />
    <Skeleton className="h-4 w-2/5" />
  </div>
));

/**
 * Pick one project from a list the service searches and sends in batches: the search waits for
 * typing to pause, and the next batch loads when the end of the list scrolls into view.
 */
export function ProjectPicker({
  value,
  onChange,
  currentId,
  teamById,
}: {
  value: string | undefined;
  onChange: (projectId: string) => void;
  /** The project every selected meeting is in already, if they share one. */
  currentId?: string;
  teamById: Map<string, Team>;
}) {
  const id = useId();
  const search = useSearchTerm();
  const projects = useProjectSearch(search.term);
  const items = projects.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="grid gap-3">
      <SearchField
        value={search.text}
        onChange={search.changeText}
        label="Search projects"
        placeholder="Search projects"
        autoFocus
      />
      <BatchedList
        query={projects}
        empty={items.length === 0}
        emptyState={
          <ListSearchEmpty what="No project" query={search.term} onClear={search.clear} />
        }
        skeleton={skeleton}
        className="-mx-2 max-h-80 px-2"
      >
        <RadioGroup value={value ?? ""} onValueChange={onChange} className="gap-0.5">
          {items.map((project) => {
            const itemId = `${id}-${project.id}`;
            return (
              <label
                key={project.id}
                htmlFor={itemId}
                className={cn(
                  "flex h-12 cursor-pointer items-center gap-3 rounded-xl px-2 transition-colors",
                  "hover:bg-muted/70 has-data-checked:bg-primary/8",
                )}
              >
                <RadioGroupItem id={itemId} value={project.id} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                  <HighlightText text={project.name} query={search.term} />
                </span>
                {project.id === currentId && <Badge variant="neutral">Current</Badge>}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {teamById.get(project.teamId)?.name}
                </span>
              </label>
            );
          })}
        </RadioGroup>
      </BatchedList>
    </div>
  );
}

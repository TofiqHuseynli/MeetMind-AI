import { useState } from "react";
import { SearchSelect } from "@/components/data-table/search-select";
import type { Project } from "@/types";
import { minListOptions } from "@/utils/min-list";
import { useProjectMinList } from "../../../meetings.queries";

/**
 * The project filter of the meeting list: projects searched by the service while the list is
 * open, only the chosen team's when there is one.
 */
export function ProjectFilter({
  value,
  teamId,
  projectById,
  onChange,
  id,
  className,
}: {
  value: string | undefined;
  teamId: string | undefined;
  projectById: Map<string, Project>;
  onChange: (projectId: string | undefined) => void;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const projects = useProjectMinList({ q: term, teamId }, open);

  return (
    <SearchSelect
      id={id}
      className={className}
      label="Project"
      allLabel="All projects"
      value={value}
      valueLabel={value ? projectById.get(value)?.name : undefined}
      options={minListOptions(projects.data)}
      query={projects}
      emptyWhat="No project"
      searchPlaceholder="Search projects"
      onChange={onChange}
      onOpenChange={setOpen}
      onTermChange={setTerm}
    />
  );
}

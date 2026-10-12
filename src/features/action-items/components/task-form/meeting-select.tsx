import { useState } from "react";
import { SearchSelect } from "@/components/data-table/search-select";
import { useMeetingMinList } from "@/features/meetings/meetings.queries";
import { minListOptions } from "@/utils/min-list";

/**
 * The meeting a new task joins, for a task made outside a meeting's page: the analysed
 * meetings, newest first, searched by the service while the list is open.
 */
export function MeetingSelect({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string | undefined;
  onChange: (meetingId: string | undefined) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  // The chosen title is kept, since that option may not be in the batches loaded next.
  const [chosenTitle, setChosenTitle] = useState<string>();
  const meetings = useMeetingMinList({ q: term, status: "ready" }, open);
  const options = minListOptions(meetings.data);

  return (
    <SearchSelect
      id={id}
      label="Meeting"
      placeholder="Pick the meeting it came from"
      value={value}
      valueLabel={chosenTitle}
      options={options}
      query={meetings}
      emptyWhat="No meeting"
      searchPlaceholder="Search meetings"
      onChange={(meetingId) => {
        setChosenTitle(options.find((option) => option.value === meetingId)?.label);
        onChange(meetingId);
      }}
      onOpenChange={setOpen}
      onTermChange={setTerm}
      invalid={invalid}
      describedBy={describedBy}
      className="w-full"
    />
  );
}

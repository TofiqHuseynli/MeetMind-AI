import type { InfiniteData } from "@tanstack/react-query";
import type { CursorPage, MinListItem } from "@/types";

/** The loaded batches of a min list as a select's options. */
export function minListOptions(data: InfiniteData<CursorPage<MinListItem>> | undefined) {
  return (
    data?.pages.flatMap((page) =>
      page.items.map((item) => ({ value: item.id, label: item.name })),
    ) ?? []
  );
}

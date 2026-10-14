import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type { PersonListItem } from "@/types";
import { useDeletePerson } from "../../people.queries";

/** Asks before a person is removed. Someone with meetings or tasks is kept by the service. */
export function DeletePersonDialog({
  person,
  onClose,
}: {
  person: PersonListItem | null;
  onClose: () => void;
}) {
  const remove = useDeletePerson();

  return (
    <ConfirmDialog
      open={person !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Remove this person?"
      description={
        person
          ? `${person.name} leaves the team list. Someone who took part in meetings or owns ` +
            "tasks stays, so nothing loses its owner."
          : ""
      }
      confirmLabel="Remove"
      destructive
      onConfirm={() => person && remove.mutate({ id: person.id })}
    />
  );
}

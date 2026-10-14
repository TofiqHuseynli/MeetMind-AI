import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PersonListItem } from "@/types";
import { useUpdatePerson } from "../../people.queries";
import type { PersonFieldsInput } from "../../people.schema";
import { PersonForm } from "./person-form";

/** A person's name, role and email, changed. Their hue stays. */
export function EditPersonDialog({
  person,
  onClose,
}: {
  /** The person being edited; null keeps the dialog closed. */
  person: PersonListItem | null;
  onClose: () => void;
}) {
  const update = useUpdatePerson();

  function save(values: PersonFieldsInput) {
    if (!person) return;
    update.mutate({ ...values, id: person.id }, { onSuccess: onClose });
  }

  return (
    <Dialog open={person !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit person</DialogTitle>
          <DialogDescription>Their meetings and tasks keep pointing at them.</DialogDescription>
        </DialogHeader>
        {person && (
          <PersonForm
            defaultValues={{ name: person.name, role: person.role, email: person.email ?? "" }}
            submitLabel="Save"
            saving={update.isPending}
            onSubmit={save}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

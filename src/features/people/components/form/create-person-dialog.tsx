import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Person } from "@/types";
import { useCreatePerson } from "../../people.queries";
import type { PersonFieldsInput } from "../../people.schema";
import { PersonForm } from "./person-form";

/**
 * A new person on the team. `onCreated` hands them back, so a picker that opened the dialog can
 * choose them at once. The form mounts on every open.
 */
export function CreatePersonDialog({
  open,
  onOpenChange,
  onCreated,
  defaultName = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (person: Person) => void;
  defaultName?: string;
}) {
  const create = useCreatePerson();

  function save(values: PersonFieldsInput) {
    create.mutate(values, {
      onSuccess: (person) => {
        onCreated?.(person);
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add person</DialogTitle>
          <DialogDescription>
            They can then take part in meetings and own tasks.
          </DialogDescription>
        </DialogHeader>
        <PersonForm
          defaultValues={{ name: defaultName, role: "", email: "" }}
          submitLabel="Add person"
          saving={create.isPending}
          onSubmit={save}
        />
      </DialogContent>
    </Dialog>
  );
}

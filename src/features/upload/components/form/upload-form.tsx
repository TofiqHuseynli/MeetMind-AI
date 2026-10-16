import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatePersonDialog } from "@/features/people/components/form/create-person-dialog";
import { cn } from "@/lib/utils";
import type { Person, Project, Team } from "@/types";
import { uploadMeetingSchema, type UploadMeetingFields } from "../../upload.schema";
import { sourceKindOf } from "../../utils/file";
import { FileDropzone } from "./file-dropzone";
import { Optional } from "./optional-mark";
import { ParticipantsPicker } from "./participants-picker";
import { SelectClearButton } from "./select-clear-button";
import { SelectedFile } from "./selected-file";

// Ids follow <feature>-<field>; each error is tied to its control through aria-describedby.
const ids = {
  file: "upload-file",
  title: "upload-title",
  team: "upload-team",
  project: "upload-project",
  participants: "upload-participants",
};

function errorId(id: string) {
  return `${id}-error`;
}

/**
 * The file, then what is known about the meeting: a title, the team and one of its projects,
 * and who took part. Only the file is required; the analysis fills in the rest. The view owns
 * the mutation.
 */
export function UploadForm({
  teams,
  projects,
  people,
  saving,
  onSubmit,
}: {
  teams: Team[];
  projects: Project[];
  /** Who can have taken part: the whole team. */
  people: Person[];
  saving: boolean;
  /** The fields, and the file they describe. */
  onSubmit: (values: UploadMeetingFields, blob: File) => void;
}) {
  const form = useForm<UploadMeetingFields>({
    resolver: zodResolver(uploadMeetingSchema),
    defaultValues: { title: "", teamId: "", projectId: "", participantIds: [] },
  });
  // The file itself; the form holds what describes it (name, size, kind) for the checks.
  const [blob, setBlob] = useState<File | null>(null);
  const [addingPerson, setAddingPerson] = useState(false);
  const { errors } = form.formState;
  const file = useWatch({ control: form.control, name: "file" });
  const teamId = useWatch({ control: form.control, name: "teamId" });
  const teamProjects = projects.filter((p) => p.teamId === teamId);
  const fileError =
    errors.file?.message ?? errors.file?.size?.message ?? errors.file?.name?.message;

  function chooseFile(chosen: File) {
    const kind = sourceKindOf(chosen.name);
    if (!kind) {
      form.setError("file", { message: "Use an audio recording or a transcript file." });
      return;
    }
    const value = { name: chosen.name, size: chosen.size, kind };
    setBlob(chosen);
    form.setValue("file", value, { shouldValidate: true });
  }

  function chooseTeam(id: string) {
    form.setValue("teamId", id, { shouldValidate: true });
    const project = projects.find((p) => p.id === form.getValues("projectId"));
    if (project?.teamId !== id) form.setValue("projectId", "");
  }

  function addParticipant(person: Person) {
    const current = form.getValues("participantIds");
    form.setValue("participantIds", [...current, person.id], { shouldValidate: true });
  }

  // The person dialog sits outside the form: React events bubble through portals, and its
  // submit would otherwise send the upload too.
  return (
    <>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => blob && onSubmit(values, blob))}
        className="grid gap-6"
      >
        <FieldGroup>
          <Field data-invalid={Boolean(fileError)}>
            <FieldLabel htmlFor={file ? undefined : ids.file}>Recording or transcript</FieldLabel>
            {/* A Controller registers the field, or resetField would leave it as it is. */}
            <Controller
              control={form.control}
              name="file"
              render={({ field }) =>
                field.value ? (
                  <SelectedFile
                    file={field.value}
                    disabled={saving}
                    onRemove={() => {
                      setBlob(null);
                      form.resetField("file");
                    }}
                  />
                ) : (
                  <FileDropzone
                    id={ids.file}
                    invalid={Boolean(fileError)}
                    describedBy={fileError ? errorId(ids.file) : undefined}
                    disabled={saving}
                    onFile={chooseFile}
                  />
                )
              }
            />
            <FieldError id={errorId(ids.file)}>{fileError}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor={ids.title}>
              Meeting title <Optional />
            </FieldLabel>
            <Input
              id={ids.title}
              placeholder="The AI names it from the talk"
              disabled={saving}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? errorId(ids.title) : undefined}
              {...form.register("title")}
            />
            <FieldError id={errorId(ids.title)} errors={[errors.title]} />
          </Field>

          <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
            <Field data-invalid={Boolean(errors.teamId)}>
              <FieldLabel htmlFor={ids.team}>
                Team <Optional />
              </FieldLabel>
              <div className="relative">
                <Select value={teamId} onValueChange={chooseTeam} disabled={saving}>
                  <SelectTrigger
                    id={ids.team}
                    aria-invalid={Boolean(errors.teamId)}
                    aria-describedby={errors.teamId ? errorId(ids.team) : undefined}
                    className={cn("w-full", teamId && "*:data-[slot=select-value]:pr-7")}
                  >
                    <SelectValue placeholder="Pick the team" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {teamId && (
                  <SelectClearButton
                    label="Clear the team"
                    disabled={saving}
                    onClear={() => chooseTeam("")}
                  />
                )}
              </div>
              <FieldError id={errorId(ids.team)} errors={[errors.teamId]} />
            </Field>

            <Field data-invalid={Boolean(errors.projectId)}>
              <FieldLabel htmlFor={ids.project}>
                Project <Optional />
              </FieldLabel>
              <Controller
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <div className="relative">
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={saving || !teamId}
                    >
                      <SelectTrigger
                        id={ids.project}
                        aria-invalid={Boolean(errors.projectId)}
                        aria-describedby={errors.projectId ? errorId(ids.project) : undefined}
                        className={cn("w-full", field.value && "*:data-[slot=select-value]:pr-7")}
                      >
                        <SelectValue
                          placeholder={teamId ? "Pick the project" : "Pick the team first"}
                        />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          {teamProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {field.value && (
                      <SelectClearButton
                        label="Clear the project"
                        disabled={saving}
                        onClear={() => field.onChange("")}
                      />
                    )}
                  </div>
                )}
              />
              <FieldError id={errorId(ids.project)} errors={[errors.projectId]} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.participantIds)}>
            <FieldLabel htmlFor={ids.participants}>
              Who took part <Optional />
            </FieldLabel>
            <Controller
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <ParticipantsPicker
                  id={ids.participants}
                  people={people}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={Boolean(errors.participantIds)}
                  describedBy={errors.participantIds ? errorId(ids.participants) : undefined}
                  disabled={saving}
                  onNewPerson={() => setAddingPerson(true)}
                />
              )}
            />
            <FieldDescription>
              Left empty, the AI finds the speakers by the names said in the meeting and adds new
              ones to People. A voice with no name stays Person 1, Person 2.
            </FieldDescription>
            <FieldError id={errorId(ids.participants)} errors={[errors.participantIds]} />
          </Field>
        </FieldGroup>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            <Upload aria-hidden />
            {saving ? "Uploading…" : "Upload and analyse"}
          </Button>
        </div>
      </form>
      <CreatePersonDialog
        open={addingPerson}
        onOpenChange={setAddingPerson}
        onCreated={addParticipant}
      />
    </>
  );
}

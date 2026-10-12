import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, Team } from "@/types";
import { uploadMeetingSchema, type UploadMeetingInput } from "../../upload.schema";
import { sourceKindOf, titleFromFileName } from "../../utils/file";
import { FileDropzone } from "./file-dropzone";
import { SelectedFile } from "./selected-file";

// Ids follow <feature>-<field>; each error is tied to its control through aria-describedby.
const ids = {
  file: "upload-file",
  title: "upload-title",
  team: "upload-team",
  project: "upload-project",
};

function errorId(id: string) {
  return `${id}-error`;
}

/**
 * The file, then where the meeting belongs: a title (taken from the file name until the user
 * writes one), the team and one of its projects. The view owns the mutation.
 */
export function UploadForm({
  teams,
  projects,
  saving,
  onSubmit,
}: {
  teams: Team[];
  projects: Project[];
  saving: boolean;
  onSubmit: (values: UploadMeetingInput) => void;
}) {
  const form = useForm<UploadMeetingInput>({
    resolver: zodResolver(uploadMeetingSchema),
    defaultValues: { title: "", teamId: "", projectId: "" },
  });
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
    form.setValue("file", value, { shouldValidate: true });
    if (!form.getFieldState("title").isDirty) {
      form.setValue("title", titleFromFileName(chosen.name), { shouldValidate: true });
    }
  }

  function chooseTeam(id: string) {
    form.setValue("teamId", id, { shouldValidate: true });
    const project = projects.find((p) => p.id === form.getValues("projectId"));
    if (project?.teamId !== id) form.setValue("projectId", "");
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(fileError)}>
          <FieldLabel htmlFor={file ? undefined : ids.file}>Recording or transcript</FieldLabel>
          {file ? (
            <SelectedFile
              file={file}
              disabled={saving}
              onRemove={() => form.resetField("file")}
            />
          ) : (
            <FileDropzone
              id={ids.file}
              invalid={Boolean(fileError)}
              describedBy={fileError ? errorId(ids.file) : undefined}
              disabled={saving}
              onFile={chooseFile}
            />
          )}
          <FieldError id={errorId(ids.file)}>{fileError}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor={ids.title}>Meeting title</FieldLabel>
          <Input
            id={ids.title}
            disabled={saving}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? errorId(ids.title) : undefined}
            {...form.register("title")}
          />
          <FieldError id={errorId(ids.title)} errors={[errors.title]} />
        </Field>

        <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
          <Field data-invalid={Boolean(errors.teamId)}>
            <FieldLabel htmlFor={ids.team}>Team</FieldLabel>
            <Select value={teamId} onValueChange={chooseTeam} disabled={saving}>
              <SelectTrigger
                id={ids.team}
                aria-invalid={Boolean(errors.teamId)}
                aria-describedby={errors.teamId ? errorId(ids.team) : undefined}
                className="w-full"
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
            <FieldError id={errorId(ids.team)} errors={[errors.teamId]} />
          </Field>

          <Field data-invalid={Boolean(errors.projectId)}>
            <FieldLabel htmlFor={ids.project}>Project</FieldLabel>
            <Controller
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={saving || !teamId}
                >
                  <SelectTrigger
                    id={ids.project}
                    aria-invalid={Boolean(errors.projectId)}
                    aria-describedby={errors.projectId ? errorId(ids.project) : undefined}
                    className="w-full"
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
              )}
            />
            <FieldError id={errorId(ids.project)} errors={[errors.projectId]} />
          </Field>
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          <Upload aria-hidden />
          {saving ? "Uploading…" : "Upload and analyse"}
        </Button>
      </div>
    </form>
  );
}

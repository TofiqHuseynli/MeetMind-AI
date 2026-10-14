import { z } from "zod";

// What the person dialog sends. Parsed in people.api.ts before anything reaches the db.

export const PERSON_NAME_MAX = 120;
const ROLE_MAX = 80;

export const personFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Write their name.")
    .max(PERSON_NAME_MAX, `Keep it under ${PERSON_NAME_MAX} characters.`),
  role: z.string().trim().max(ROLE_MAX, `Keep it under ${ROLE_MAX} characters.`),
  /** Optional: needed only to sign in, and to link their account to them. */
  email: z.union([z.literal(""), z.email("Enter an email address, or leave it empty.").trim()]),
});

export type PersonFieldsInput = z.infer<typeof personFieldsSchema>;

export const personRefSchema = z.object({ id: z.string().min(1) });

export type PersonRef = z.infer<typeof personRefSchema>;

export const updatePersonSchema = personFieldsSchema.extend(personRefSchema.shape);

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;

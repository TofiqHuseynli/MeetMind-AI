/** The plain JSON Schema the answers are described with; each adapter turns it into its own. */
export type JsonSchema = {
  type: string | readonly string[];
  properties?: Record<string, JsonSchema>;
  required?: readonly string[];
  items?: JsonSchema;
  enum?: readonly string[];
};

export type JsonRequest = {
  system: string;
  prompt: string;
  schema: JsonSchema;
};

/** A language model that answers with JSON in the shape asked for. */
export type LanguageModel = {
  name: string;
  /** The answer, parsed from JSON; the caller checks it against its zod schema. */
  generateJson: (request: JsonRequest) => Promise<unknown>;
};

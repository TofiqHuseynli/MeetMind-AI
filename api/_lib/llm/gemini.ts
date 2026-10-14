import { HttpError } from "../http.js";
import type { JsonRequest, JsonSchema, LanguageModel } from "./types.js";

// Google Gemini through its REST API: one generateContent call with JSON output. The free tier
// is enough for demos; it may keep what it is sent to improve Google's products.

const DEFAULT_MODEL = "gemini-2.5-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// The older structured output field takes an OpenAPI subset: upper case types and `nullable`.
function toOpenApi(schema: JsonSchema): Record<string, unknown> {
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const type = types.find((t) => t !== "null") ?? "string";
  return {
    type: type.toUpperCase(),
    ...(types.includes("null") ? { nullable: true } : {}),
    ...(schema.enum ? { enum: schema.enum } : {}),
    ...(schema.items ? { items: toOpenApi(schema.items) } : {}),
    ...(schema.properties
      ? {
          properties: Object.fromEntries(
            Object.entries(schema.properties).map(([key, value]) => [key, toOpenApi(value)]),
          ),
          required: schema.required,
        }
      : {}),
  };
}

type GeminiAnswer = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
};

async function call(model: string, key: string, body: object): Promise<GeminiAnswer> {
  const response = await fetch(`${BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });
  const answer = (await response.json().catch(() => ({}))) as GeminiAnswer;
  if (response.status === 429) {
    throw new HttpError(429, "The AI service is busy (free tier limit). Try again in a minute.");
  }
  if (!response.ok) {
    const message = answer.error?.message ?? `The AI service answered ${response.status}.`;
    throw new HttpError(response.status === 400 ? 400 : 502, message);
  }
  return answer;
}

export function gemini(): LanguageModel {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(500, "Set GEMINI_API_KEY for the analysis.");
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  return {
    name: `gemini/${model}`,
    async generateJson({ system, prompt, schema }: JsonRequest) {
      const base = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      let answer: GeminiAnswer;
      try {
        answer = await call(model, key, {
          ...base,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseJsonSchema: schema,
          },
        });
      } catch (error) {
        // A model or API version without JSON Schema output takes the older field.
        if (!(error instanceof HttpError) || error.status !== 400) throw error;
        answer = await call(model, key, {
          ...base,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: toOpenApi(schema),
          },
        });
      }

      const blocked = answer.promptFeedback?.blockReason;
      if (blocked) throw new HttpError(422, `The AI service refused the transcript (${blocked}).`);
      const candidate = answer.candidates?.[0];
      const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
      if (!text) {
        const reason = candidate?.finishReason ?? "empty";
        throw new HttpError(502, `The AI service sent no answer (${reason}).`);
      }
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new HttpError(502, "The AI service sent an answer that is not JSON.");
      }
    },
  };
}

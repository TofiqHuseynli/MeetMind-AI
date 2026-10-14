import { HttpError } from "../http.js";
import type { JsonRequest, JsonSchema, LanguageModel } from "./types.js";

// Google Gemini through its REST API: one generateContent call with JSON output. The free tier
// is enough for demos; it may keep what it is sent to improve Google's products.

// The models tried in turn while one stays overloaded on the free tier: a fast Flash first, the
// light one next, the newest last (the "latest" alias queued for minutes in testing). Older
// names close to new users (2.5 did). GEMINI_MODEL, a comma list, picks others.
const DEFAULT_MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-flash-latest"];
// A small job somebody waits on: the light model answered in two seconds in testing.
const FAST_MODELS = ["gemini-flash-lite-latest", "gemini-3.5-flash"];
// The free tier answers 503 "high demand" now and then; a short wait usually clears it.
const RETRIES = 2;
const RETRY_WAIT_MS = 4000;
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
  for (let attempt = 0; ; attempt += 1) {
    const answer = await callOnce(model, key, body);
    if (answer !== "busy") return answer;
    if (attempt >= RETRIES) {
      throw new HttpError(503, "The AI service is overloaded right now. Try again in a minute.");
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_WAIT_MS * (attempt + 1)));
  }
}

// One request; "busy" when the service is overloaded and the request can be sent again.
async function callOnce(
  model: string,
  key: string,
  body: object,
): Promise<GeminiAnswer | "busy"> {
  const response = await fetch(`${BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });
  const answer = (await response.json().catch(() => ({}))) as GeminiAnswer;
  if (response.status === 503 || response.status === 500) return "busy";
  if (response.status === 429) {
    throw new HttpError(429, "The AI service is busy (free tier limit). Try again in a minute.");
  }
  if (!response.ok) {
    const message = answer.error?.message ?? `The AI service answered ${response.status}.`;
    throw new HttpError(response.status === 400 ? 400 : 502, message);
  }
  return answer;
}

/** One model's JSON answer; an API version without JSON Schema output takes the older field. */
async function answerWith(model: string, key: string, request: JsonRequest): Promise<GeminiAnswer> {
  const base = {
    systemInstruction: { parts: [{ text: request.system }] },
    contents: [{ role: "user", parts: [{ text: request.prompt }] }],
  };
  const config = { temperature: 0.2, responseMimeType: "application/json" };
  try {
    return await call(model, key, {
      ...base,
      generationConfig: { ...config, responseJsonSchema: request.schema },
    });
  } catch (error) {
    if (!(error instanceof HttpError) || error.status !== 400) throw error;
    return call(model, key, {
      ...base,
      generationConfig: { ...config, responseSchema: toOpenApi(request.schema) },
    });
  }
}

function textOf(answer: GeminiAnswer): unknown {
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
}

export function gemini(): LanguageModel {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(500, "Set GEMINI_API_KEY for the analysis.");
  const models = process.env.GEMINI_MODEL
    ? process.env.GEMINI_MODEL.split(",").map((m) => m.trim()).filter(Boolean)
    : DEFAULT_MODELS;

  return {
    name: `gemini/${models[0]}`,
    async generateJson(request: JsonRequest) {
      let busy: unknown;
      const order = request.fast && !process.env.GEMINI_MODEL ? FAST_MODELS : models;
      for (const model of order) {
        try {
          return textOf(await answerWith(model, key, request));
        } catch (error) {
          // Overloaded after its retries, or its free quota used up: each model has its own, so
          // the next one may have room.
          const full = error instanceof HttpError && (error.status === 503 || error.status === 429);
          if (!full) throw error;
          console.warn(`${model} is overloaded or out of quota; trying the next model.`);
          busy = error;
        }
      }
      throw busy;
    },
  };
}

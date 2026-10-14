import { HttpError } from "../http.js";
import { gemini } from "./gemini.js";
import type { LanguageModel } from "./types.js";

/**
 * The language model the analysis uses, by LLM_PROVIDER. Gemini is the default; another one
 * plugs in here without touching the analysis.
 */
export function languageModel(): LanguageModel {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  if (provider === "gemini") return gemini();
  throw new HttpError(500, `LLM_PROVIDER "${provider}" is not set up; use "gemini".`);
}

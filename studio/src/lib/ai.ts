// ============================================================
// AI provider settings — BYO key, provider-agnostic.
// OmniRoute (free local gateway) is the default provider.
// ============================================================

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";

export type AiProviderId =
  | "omniroute"
  | "gemini"
  | "groq"
  | "openrouter"
  | "openai"
  | "deepseek"
  | "anthropic"
  | "ollama"
  | "custom";

export interface AiSettings {
  provider: AiProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const SETTINGS_KEY = "kerozel.settings.v1";

export interface ProviderPreset {
  label: string;
  baseUrl: string;
  model: string;
  hint: string;
}

export const PROVIDER_PRESETS: Record<AiProviderId, ProviderPreset> = {
  omniroute: {
    label: "OmniRoute (local)",
    baseUrl: "http://localhost:20128/v1",
    model: "auto",
    hint: "Free local gateway: `npm i -g omniroute`, run `omniroute`, then connect your free/paid keys in its dashboard. Automatic free-tier fallback.",
  },
  gemini: {
    label: "Google Gemini (free tier)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.5-flash",
    hint: "Free API key from aistudio.google.com — no credit card required.",
  },
  groq: {
    label: "Groq (free tier)",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    hint: "Free key from console.groq.com. Very fast inference.",
  },
  openrouter: {
    label: "OpenRouter (:free models)",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    hint: "One key from openrouter.ai; ~30 free models (`:free` suffix). Free models can go offline anytime.",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    hint: "Paid — cheapest OpenAI model.",
  },
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    hint: "Very cheap per token (not free).",
  },
  anthropic: {
    label: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4",
    hint: "Paid — the model the carousel-writing skill was built around.",
  },
  ollama: {
    label: "Ollama (local)",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2",
    hint: "Local, free, no key, no rate limits. Install from ollama.com.",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    baseUrl: "",
    model: "",
    hint: "Any OpenAI-compatible endpoint: LM Studio, vLLM, a corporate proxy, etc.",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDER_PRESETS) as AiProviderId[];

export function defaultSettings(): AiSettings {
  const p = PROVIDER_PRESETS.omniroute;
  return { provider: "omniroute", apiKey: "", baseUrl: p.baseUrl, model: p.model };
}

export function loadSettings(): AiSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    const provider = (PROVIDER_IDS.includes(parsed.provider as AiProviderId)
      ? parsed.provider
      : "omniroute") as AiProviderId;
    const preset = PROVIDER_PRESETS[provider];
    return {
      provider,
      apiKey: parsed.apiKey ?? "",
      baseUrl: parsed.baseUrl || preset.baseUrl,
      model: parsed.model || preset.model,
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: AiSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

/**
 * Build a callable AI SDK model from the user's settings.
 * Throws a descriptive Error when configuration is missing.
 */
export function buildModel(s: AiSettings) {
  const baseUrl = s.baseUrl.trim();
  const apiKey = s.apiKey.trim();
  const model = s.model.trim();
  if (!model) {
    throw new Error("No model configured. Open Settings and pick a provider + model.");
  }
  if (!baseUrl) {
    throw new Error("No base URL configured. Open Settings and set one (or pick a preset provider).");
  }

  switch (s.provider) {
    case "openai":
      return createOpenAI({ baseURL: baseUrl, apiKey: apiKey || undefined })(model);
    case "anthropic":
      return createAnthropic({ baseURL: baseUrl, apiKey: apiKey || undefined })(model);
    case "gemini":
      return createGoogle({ baseURL: baseUrl, apiKey: apiKey || undefined })(model);
    case "omniroute":
    case "groq":
    case "openrouter":
    case "deepseek":
    case "ollama":
    case "custom":
    default:
      return createOpenAICompatible({ name: s.provider, baseURL: baseUrl, apiKey: apiKey || undefined })(model);
  }
}
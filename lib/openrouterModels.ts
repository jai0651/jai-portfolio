const MODELS_URL = "https://openrouter.ai/api/v1/models";

// Static fallback used only if the live model list can't be fetched.
const STATIC_FREE_MODELS = [
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-235b-a22b:free",
];

// Families we prefer for a portfolio chat assistant, in priority order.
const PREFERRED = [
  "gpt-oss",
  "llama",
  "qwen",
  "mistral",
  "gemma",
  "deepseek",
];

interface OpenRouterModel {
  id: string;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { output_modalities?: string[] };
}

let cache: { models: string[]; expires: number } | null = null;
const TTL_MS = 10 * 60 * 1000;

function isFree(m: OpenRouterModel): boolean {
  const p = m.pricing || {};
  return Number(p.prompt ?? "1") === 0 && Number(p.completion ?? "1") === 0;
}

function score(id: string): number {
  const idx = PREFERRED.findIndex((p) => id.includes(p));
  return idx === -1 ? PREFERRED.length : idx;
}

/**
 * Fetches the list of currently-available free, text-output models from
 * OpenRouter so we never call retired/renamed slugs. Cached for 10 minutes.
 */
export async function getFreeModels(apiKey: string): Promise<string[]> {
  if (cache && cache.expires > Date.now()) return cache.models;

  try {
    const res = await fetch(MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`models endpoint ${res.status}`);
    const json = (await res.json()) as { data?: OpenRouterModel[] };
    const data = json.data || [];

    const free = data
      .filter((m) => m.id.endsWith(":free") && isFree(m))
      .filter((m) => {
        const out = m.architecture?.output_modalities;
        return !out || out.includes("text");
      })
      .map((m) => m.id)
      .sort((a, b) => score(a) - score(b));

    if (free.length) {
      cache = { models: free, expires: Date.now() + TTL_MS };
      return free;
    }
  } catch {
    // fall through to static list
  }

  return STATIC_FREE_MODELS;
}

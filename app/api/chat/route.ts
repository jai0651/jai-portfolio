import { NextRequest } from "next/server";
import { getPortfolioContext } from "@/lib/portfolioContext";
import { getFreeModels } from "@/lib/openrouterModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/*
 * Free OpenRouter models are slow — measured between 6s and 59s to first
 * response. Vercel's default function timeout would kill the request before a
 * fallback could answer, so the ceiling is raised for the fallback path.
 * OpenAI normally answers in ~1.5s and never gets near this.
 */
export const maxDuration = 60;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// How many distinct models to try before giving up, and how long to wait
// before a single retry pass when everything is transiently rate-limited.
const MAX_MODELS_TO_TRY = 6;
const RATE_LIMIT_RETRY_MS = 2500;

/*
 * Provider selection, with the other provider as a fallback.
 *
 * AI_PROVIDER=openai|openrouter sets the preference, so both keys can live in
 * .env and you switch by changing one variable instead of deleting a key. Any
 * provider that has a key is kept in the chain — whichever isn't preferred
 * becomes the safety net, which matters because OpenRouter's free tier can be
 * rate-limited or simply unavailable.
 */
type ProviderName = "openai" | "openrouter";

const PROVIDER_OVERRIDE = process.env.AI_PROVIDER?.trim().toLowerCase();
const HAS_OPENAI = Boolean(process.env.OPENAI_API_KEY);
const HAS_OPENROUTER = Boolean(process.env.OPENROUTER_API_KEY);

const PROVIDER_ORDER: ProviderName[] = (() => {
  const preferred: ProviderName =
    PROVIDER_OVERRIDE === "openrouter" ? "openrouter" : "openai";
  const other: ProviderName =
    preferred === "openai" ? "openrouter" : "openai";
  const has = (p: ProviderName) => (p === "openai" ? HAS_OPENAI : HAS_OPENROUTER);
  return ([preferred, other] as ProviderName[]).filter(has);
})();

const urlFor = (p: ProviderName) => (p === "openai" ? OPENAI_URL : OPENROUTER_URL);
const keyFor = (p: ProviderName) =>
  p === "openai" ? process.env.OPENAI_API_KEY : process.env.OPENROUTER_API_KEY;

/*
 * Sampling defaults, and the escalating fallbacks used when a model rejects
 * them. Newer OpenAI models (gpt-5.6-luna, gpt-5-mini) refuse a custom
 * `temperature` and require `max_completion_tokens` instead of `max_tokens`;
 * across OpenRouter's several hundred models the support matrix is uneven
 * enough that probing beats maintaining a list.
 */
const TEMPERATURE = 0.4;
const MAX_OUTPUT_TOKENS = 600;

type ParamMode = 0 | 1 | 2;

function samplingParams(mode: ParamMode): Record<string, unknown> {
  if (mode === 0) return { temperature: TEMPERATURE, max_tokens: MAX_OUTPUT_TOKENS };
  // Drop the custom temperature, switch to the newer token cap.
  if (mode === 1) return { max_completion_tokens: MAX_OUTPUT_TOKENS };
  // Last resort: let the model use all its own defaults.
  return {};
}

/** Does this 400 look like "you sent a parameter I don't accept"? */
function isParamRejection(status: number, detail: string): boolean {
  return (
    status === 400 &&
    /unsupported (parameter|value)|max_tokens|max_completion_tokens|temperature|not supported/i.test(
      detail
    )
  );
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractErrorMessage(detail: string): string {
  try {
    const json = JSON.parse(detail);
    return json?.error?.message || json?.message || detail;
  } catch {
    return detail;
  }
}

export async function POST(req: NextRequest) {
  if (PROVIDER_ORDER.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          "The AI assistant isn't configured yet. Add an OPENAI_API_KEY (or OPENROUTER_API_KEY) to enable it.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  // Keep only the last 12 turns and trim overly long inputs.
  const recent = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  const { name, knowledge } = await getPortfolioContext();

  const systemPrompt = `You are "${name}'s AI assistant", a friendly, professional chatbot embedded on ${name}'s personal portfolio website. You help recruiters, hiring managers, and visitors learn about ${name}.

Use ONLY the verified portfolio information below to answer questions about ${name}. If something isn't covered, say you don't have that detail and suggest they use the contact form or email. Never invent facts, employers, dates, or credentials.

Guidelines:
- Speak about ${name} in the third person (e.g. "Jai has...").
- Be concise, warm, and confident. Use short paragraphs or bullet points.
- Highlight relevant strengths for recruiters (skills, impact, experience).
- For "how do I contact / hire" questions, point them to the contact page/email.
- Politely decline off-topic requests and steer back to ${name}'s background.
- Keep answers under ~150 words unless asked for detail.

=== VERIFIED PORTFOLIO KNOWLEDGE BASE ===
${knowledge}
=== END KNOWLEDGE BASE ===`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...recent,
  ];

  let lastStatus = 0;
  let lastDetail = "";
  // Auth failures are tracked per provider so a bad OpenRouter key doesn't
  // stop us reaching OpenAI.
  const authBlocked = new Set<ProviderName>();

  /** Models to try for a provider, best-first. */
  const candidatesFor = async (p: ProviderName): Promise<string[]> => {
    if (p === "openai") return [process.env.OPENAI_MODEL || "gpt-4o-mini"];

    /*
     * An explicitly configured OPENROUTER_MODEL is a deliberate, verified
     * choice and is used alone. Appending auto-discovered free models after it
     * would be worse than having no fallback: measured behaviour on the free
     * tier included empty responses, fabricated employment details, leaked
     * chain-of-thought, and 59s latencies. The cross-provider fallback to
     * OpenAI already covers a genuine outage.
     */
    if (process.env.OPENROUTER_MODEL) return [process.env.OPENROUTER_MODEL];

    // Nothing configured — discover free models, avoiding retired slugs.
    return (await getFreeModels(process.env.OPENROUTER_API_KEY!)).slice(
      0,
      MAX_MODELS_TO_TRY
    );
  };

  const attempt = async (
    p: ProviderName,
    model: string
  ): Promise<Response | null> => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${keyFor(p)}`,
      "Content-Type": "application/json",
    };
    // OpenRouter-specific attribution headers (ignored by OpenAI).
    if (p === "openrouter") {
      headers["HTTP-Referer"] =
        process.env.NEXTAUTH_URL || "https://jai-portfolio.local";
      headers["X-Title"] = `${name} Portfolio Assistant`;
    }

    // Walk the sampling modes down until the model stops complaining.
    for (const mode of [0, 1, 2] as ParamMode[]) {
      try {
        const res = await fetch(urlFor(p), {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            ...samplingParams(mode),
          }),
        });

        if (res.ok && res.body) return res;

        lastStatus = res.status;
        lastDetail = await res.text().catch(() => "");

        if (isParamRejection(res.status, lastDetail) && mode < 2) {
          console.warn(
            `[chat] ${p} "${model}" rejected sampling mode ${mode}; retrying with a reduced parameter set.`
          );
          continue;
        }

        console.error(
          `[chat] ${p} ${res.status} for model "${model}": ${lastDetail.slice(0, 300)}`
        );
        if (res.status === 401 || res.status === 403) authBlocked.add(p);
        return null;
      } catch (e) {
        lastDetail = e instanceof Error ? e.message : "network error";
        console.error(`[chat] ${p} fetch failed for "${model}": ${lastDetail}`);
        return null;
      }
    }
    return null;
  };

  /*
   * Try the preferred provider's models, then fall through to the other one.
   * A provider can fail wholesale — rate limits, an outage, a rejected key,
   * a free tier that quietly stops answering — and the visitor shouldn't see
   * any of that as long as the other provider is configured.
   */
  const runProviders = async (): Promise<Response | null> => {
    for (const p of PROVIDER_ORDER) {
      if (authBlocked.has(p)) continue;
      const models = await candidatesFor(p).catch(() => []);
      for (const model of models) {
        const res = await attempt(p, model);
        if (res) return res;
        if (authBlocked.has(p)) break; // whole provider is unusable
      }
      if (PROVIDER_ORDER.length > 1) {
        console.warn(`[chat] ${p} exhausted; falling through to the next provider.`);
      }
    }
    return null;
  };

  let upstream = await runProviders();

  // If everything was merely rate-limited, wait briefly and make one more pass.
  if (!upstream && lastStatus === 429) {
    await sleep(RATE_LIMIT_RETRY_MS);
    upstream = await runProviders();
  }

  if (!upstream || !upstream.body) {
    const apiMessage = extractErrorMessage(lastDetail);
    const rateLimited = lastStatus === 429;
    // Only reached once EVERY configured provider has failed.
    const allAuthBlocked = PROVIDER_ORDER.every((p) => authBlocked.has(p));
    let error: string;
    if (allAuthBlocked) {
      error =
        PROVIDER_ORDER.length > 1
          ? "Both AI provider keys were rejected. Check OPENAI_API_KEY and OPENROUTER_API_KEY are valid and funded."
          : PROVIDER_ORDER[0] === "openai"
            ? "The OpenAI API key was rejected. Check OPENAI_API_KEY is valid and has billing/credits enabled."
            : "The OpenRouter API key was rejected. Double-check OPENROUTER_API_KEY is valid and active.";
    } else if (rateLimited) {
      error =
        PROVIDER_ORDER.length > 1
          ? "Every configured AI provider is rate-limiting right now. Please try again in a few seconds."
          : PROVIDER_ORDER[0] === "openai"
            ? "OpenAI is rate-limiting requests (check your usage limits/quota). Please try again shortly."
            : "The free AI models are busy right now (rate-limited). Please try again in a few seconds — or add a small credit to your OpenRouter account for higher limits.";
    } else if (/data policy|no endpoints|privacy/i.test(apiMessage)) {
      error =
        "OpenRouter blocked the free models for this account. Enable free/logged models at openrouter.ai/settings/privacy, then try again.";
    } else {
      error = apiMessage
        ? `AI service error: ${apiMessage.slice(0, 200)}`
        : "The AI service returned an error. Please try again.";
    }
    return new Response(JSON.stringify({ error }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Transform the provider's SSE stream into a plain-text token stream.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  // Captured so the stream closure has a non-null binding to read from.
  const upstreamBody = upstream.body;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const token = json.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // ignore keep-alive / partial frames
            }
          }
        }
      } catch {
        // swallow stream errors; client will see truncated output
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

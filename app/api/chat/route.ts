import { NextRequest } from "next/server";
import { getPortfolioContext } from "@/lib/portfolioContext";
import { getFreeModels } from "@/lib/openrouterModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// How many distinct models to try before giving up, and how long to wait
// before a single retry pass when everything is transiently rate-limited.
const MAX_MODELS_TO_TRY = 6;
const RATE_LIMIT_RETRY_MS = 2500;

// Prefer the user's own OpenAI key (reliable, no shared rate limits); fall
// back to OpenRouter free models if only that key is configured.
const USE_OPENAI = Boolean(process.env.OPENAI_API_KEY);
const API_URL = USE_OPENAI ? OPENAI_URL : OPENROUTER_URL;
const API_KEY = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;

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
  const apiKey = API_KEY;
  if (!apiKey) {
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

  // Build the candidate list: configured model first, then live free models
  // discovered from OpenRouter (avoids retired/renamed slugs).
  // With OpenAI we use a single reliable model. With OpenRouter we try the
  // configured model first, then live-discovered free models.
  const candidates = USE_OPENAI
    ? [process.env.OPENAI_MODEL || "gpt-4o-mini"]
    : Array.from(
        new Set(
          [process.env.OPENROUTER_MODEL, ...(await getFreeModels(apiKey))].filter(
            (m): m is string => Boolean(m)
          )
        )
      ).slice(0, MAX_MODELS_TO_TRY);

  let upstream: Response | null = null;
  let lastStatus = 0;
  let lastDetail = "";
  let authBlocked = false;

  const attempt = async (model: string): Promise<Response | null> => {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      // OpenRouter-specific attribution headers (ignored by OpenAI).
      if (!USE_OPENAI) {
        headers["HTTP-Referer"] =
          process.env.NEXTAUTH_URL || "https://jai-portfolio.local";
        headers["X-Title"] = `${name} Portfolio Assistant`;
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.4,
          max_tokens: 600,
        }),
      });

      if (res.ok && res.body) return res;

      lastStatus = res.status;
      lastDetail = await res.text().catch(() => "");
      console.error(
        `[chat] ${USE_OPENAI ? "OpenAI" : "OpenRouter"} ${res.status} for model "${model}": ${lastDetail.slice(0, 300)}`
      );
      if (res.status === 401 || res.status === 403) authBlocked = true;
    } catch (e) {
      lastDetail = e instanceof Error ? e.message : "network error";
      console.error(`[chat] fetch failed for model "${model}": ${lastDetail}`);
    }
    return null;
  };

  // Pass 1: try each candidate once.
  for (const model of candidates) {
    upstream = await attempt(model);
    if (upstream) break;
    if (authBlocked) break;
  }

  // Pass 2: if everything was just rate-limited (429), wait briefly and retry.
  if (!upstream && !authBlocked && lastStatus === 429) {
    await sleep(RATE_LIMIT_RETRY_MS);
    for (const model of candidates) {
      upstream = await attempt(model);
      if (upstream) break;
    }
  }

  if (!upstream || !upstream.body) {
    const apiMessage = extractErrorMessage(lastDetail);
    const rateLimited = lastStatus === 429;
    let error: string;
    if (authBlocked) {
      error = USE_OPENAI
        ? "The OpenAI API key was rejected. Check OPENAI_API_KEY is valid and has billing/credits enabled."
        : "The OpenRouter API key was rejected. Double-check OPENROUTER_API_KEY is valid and active.";
    } else if (rateLimited) {
      error = USE_OPENAI
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

  // Transform OpenRouter SSE stream into a plain-text token stream.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
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

import "server-only";

export type InsightDraft = { category: string; severity: string; title: string; description: string };

type ProviderConfig = { baseUrl: string; apiKey: string; model: string; timeoutMs: number; maxTokens: number };

function resolveProvider(): ProviderConfig | null {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) {
    return {
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
      timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS || 10_000),
      // gemini-flash-latest spends part of its budget on internal "thinking"
      // before the visible answer, so this needs headroom beyond the actual
      // (short) rewritten title/description text.
      maxTokens: Number(process.env.GEMINI_MAX_TOKENS || 2000),
    };
  }
  if (process.env.ASSISTANT_PROVIDER && process.env.ASSISTANT_API_KEY && process.env.ASSISTANT_MODEL && process.env.ASSISTANT_API_BASE_URL) {
    return {
      baseUrl: process.env.ASSISTANT_API_BASE_URL,
      apiKey: process.env.ASSISTANT_API_KEY,
      model: process.env.ASSISTANT_MODEL,
      timeoutMs: Number(process.env.ASSISTANT_TIMEOUT_MS || 15_000),
      maxTokens: Number(process.env.ASSISTANT_MAX_TOKENS || 600),
    };
  }
  return null;
}

export function aiInsightsLlmConfigured(): boolean {
  return resolveProvider() !== null;
}

/**
 * Rephrases rule-computed insight drafts into clearer, more natural language.
 * The rule engine (aiInsights.ts) remains the sole source of truth for facts,
 * thresholds and numbers, this only restyles title/description text for a
 * bounded batch, in the same order, same count. Falls back silently to the
 * original drafts on any failure, timeout, or when no provider is configured
 *, the dashboard never depends on this succeeding.
 */
export async function rephraseInsights(officeLabel: string, drafts: InsightDraft[]): Promise<InsightDraft[]> {
  if (drafts.length === 0) return drafts;
  const provider = resolveProvider();
  if (!provider) return drafts;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);
  try {
    const res = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.4,
        max_tokens: provider.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write short, specific operations recommendations for a premium home-cleaning company's management dashboard. " +
              "You are given a JSON array of computed facts (category, severity, title, description) already determined by " +
              "deterministic business logic, treat every number and name in them as ground truth; never invent, alter, or drop " +
              "a fact, date, or figure. Rewrite ONLY the 'title' (max 70 chars) and 'description' (max 160 chars, one actionable " +
              "sentence) for each item, in the same order, same count. Return JSON: " +
              '{"insights":[{"title":string,"description":string}, ...]}.',
          },
          {
            role: "user",
            content: `Office: ${officeLabel}\n${JSON.stringify(drafts.map((d) => ({ category: d.category, severity: d.severity, title: d.title, description: d.description })))}`,
          },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return drafts;

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return drafts;

    const parsed = JSON.parse(raw) as { insights?: Array<{ title?: unknown; description?: unknown }> };
    if (!Array.isArray(parsed.insights) || parsed.insights.length !== drafts.length) return drafts;

    return drafts.map((draft, index) => {
      const rewritten = parsed.insights![index];
      return {
        ...draft,
        title: typeof rewritten.title === "string" && rewritten.title.trim() ? rewritten.title.trim().slice(0, 120) : draft.title,
        description: typeof rewritten.description === "string" && rewritten.description.trim() ? rewritten.description.trim().slice(0, 300) : draft.description,
      };
    });
  } catch {
    return drafts;
  } finally {
    clearTimeout(timeout);
  }
}
